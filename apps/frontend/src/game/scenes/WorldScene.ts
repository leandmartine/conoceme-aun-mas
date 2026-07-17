import Phaser from 'phaser';
import type { PlaceId, PlacesIndexDto } from '@conoceme/shared';
import { CompassHud } from '../systems/CompassHud';
import { VirtualJoystick } from '../systems/VirtualJoystick';
import {
  labelForPoi,
  placesToPois,
  spawnFromPlaces,
  WORLD_SIZE,
  type WorldPoi,
} from '../world/mapLayout';
import { drawUruguayMap } from '../world/drawUruguayMap';
import { gameAudio } from '../../audio/gameAudio';
import type { PlacePanel } from '../../ui/placePanel';
import { loadVisited, markVisited } from '../systems/progressStore';

export interface WorldSceneData {
  places: PlacesIndexDto;
  hudHost: HTMLElement;
  placePanel: PlacePanel;
  onExit?: () => void | Promise<void>;
}

const SPEED = 210;
const INTERACT_RADIUS = 70;

export class WorldScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    w: Phaser.Input.Keyboard.Key;
    a: Phaser.Input.Keyboard.Key;
    s: Phaser.Input.Keyboard.Key;
    d: Phaser.Input.Keyboard.Key;
  };
  private interactKey!: Phaser.Input.Keyboard.Key;
  private joystick!: VirtualJoystick;
  private compass!: CompassHud;
  private pois: WorldPoi[] = [];
  private nearest: WorldPoi | null = null;
  private focusedId: PlaceId | null = null;
  private prompt!: Phaser.GameObjects.Text;
  private placePanel!: PlacePanel;
  private bearingArrow!: Phaser.GameObjects.Triangle;
  private hudHost!: HTMLElement;
  private playerShadow!: Phaser.GameObjects.Image;
  private facing: 'down' | 'up' | 'left' | 'right' = 'down';
  private visited = new Set<PlaceId>();
  private progressLabel!: HTMLElement | null;
  private nearRing!: Phaser.GameObjects.Arc;
  private completionShown = false;

  constructor() {
    super('World');
  }

  init(data: WorldSceneData): void {
    this.pois = placesToPois(data.places.places);
    this.placePanel = data.placePanel;
    this.hudHost = data.hudHost;
  }

  create(data: WorldSceneData): void {
    this.drawWorld();
    this.spawnPois();

    const spawn = spawnFromPlaces(data.places.places, data.places.spawnPlaceId);
    // Spawn on the promenade, slightly north of water edge
    const sx = spawn.x;
    const sy = spawn.y - 20;

    this.playerShadow = this.add.image(sx, sy + 30, 'shadow').setDepth(9);
    this.player = this.physics.add.sprite(sx, sy, 'player', 0);
    this.player.setDepth(10);
    this.player.setCollideWorldBounds(true);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setSize(28, 20);
    body.setOffset(10, 52);
    this.player.play('idle-down');
    this.addAmbientFx();

    this.physics.world.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);
    this.cameras.main.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);
    // Match land so no green “mystery strip” peeks under/around the world
    this.cameras.main.setBackgroundColor('#0f3550');

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      w: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.interactKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    this.joystick = new VirtualJoystick(this);
    this.visited = loadVisited();

    this.compass = new CompassHud(this.hudHost);
    this.compass.setPois(this.pois, this.visited);
    this.compass.setFocusHandler((id) => {
      this.focusedId = id;
      gameAudio.tick();
    });

    this.nearRing = this.add
      .circle(0, 0, INTERACT_RADIUS, 0xf4c430, 0.08)
      .setStrokeStyle(2, 0xf4c430, 0.45)
      .setDepth(4)
      .setVisible(false);

    this.prompt = this.add
      .text(0, 0, '', {
        fontFamily: 'DM Sans, system-ui, sans-serif',
        fontSize: '14px',
        color: '#f7f2e9',
        backgroundColor: 'rgba(11,18,32,0.82)',
        padding: { x: 12, y: 7 },
      })
      .setDepth(20)
      .setOrigin(0.5, 1)
      .setVisible(false);

    this.bearingArrow = this.add
      .triangle(0, 0, 0, 16, 10, 0, 20, 16, 0xe07a5f, 0.9)
      .setDepth(15)
      .setVisible(false);

    // Mobile interact button
    const interactBtn = this.add
      .circle(this.cameras.main.width - 72, this.cameras.main.height - 100, 36, 0xe07a5f, 0.9)
      .setScrollFactor(0)
      .setDepth(1000)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0xf7f2e9, 0.35);
    this.add
      .text(this.cameras.main.width - 72, this.cameras.main.height - 100, 'E', {
        fontFamily: 'DM Sans, system-ui',
        fontSize: '18px',
        color: '#f7f2e9',
        fontStyle: 'bold',
      })
      .setScrollFactor(0)
      .setDepth(1001)
      .setOrigin(0.5);
    interactBtn.on('pointerdown', () => this.tryInteract());

    this.mountDomHud(data);

    this.cameras.main.fadeIn(650, 79, 122, 88);
  }

  private mountDomHud(data: WorldSceneData): void {
    const bar = document.createElement('div');
    bar.className = 'game-topbar';
    bar.innerHTML = `
      <button type="button" class="game-topbar__btn" data-exit>← Salir</button>
      <p class="game-topbar__hint">WASD / flechas · E interactuar · brújula abajo-derecha</p>
      <p class="game-topbar__progress" data-progress></p>
      <button type="button" class="game-topbar__btn game-topbar__btn--mute" data-mute aria-label="Silenciar">
        ${gameAudio.isMuted() ? '🔇' : '🔊'}
      </button>
    `;
    this.hudHost.append(bar);
    this.progressLabel = bar.querySelector('[data-progress]');
    this.refreshProgressUi();

    bar.querySelector('[data-exit]')?.addEventListener('click', () => {
      void data.onExit?.();
    });
    const muteBtn = bar.querySelector('[data-mute]') as HTMLButtonElement | null;
    muteBtn?.addEventListener('click', () => {
      gameAudio.setMuted(!gameAudio.isMuted());
      if (muteBtn) muteBtn.textContent = gameAudio.isMuted() ? '🔇' : '🔊';
    });

    // First-time coach mark
    try {
      if (!localStorage.getItem('conoceme-coach')) {
        const coach = document.createElement('div');
        coach.className = 'game-coach';
        coach.innerHTML = `
          <p><strong>Estás en la Rambla.</strong> Caminá hacia los totems dorados. Cada uno es un capítulo (experiencia, estudios, GitHub…).</p>
          <button type="button" data-dismiss>Entendido</button>
        `;
        this.hudHost.append(coach);
        coach.querySelector('[data-dismiss]')?.addEventListener('click', () => {
          coach.remove();
          localStorage.setItem('conoceme-coach', '1');
          gameAudio.tick();
        });
      }
    } catch {
      /* ignore */
    }
  }

  override update(): void {
    if (!this.player?.body) return;
    if (this.placePanel.isOpen) {
      this.player.setVelocity(0, 0);
      this.playerShadow?.setPosition(this.player.x, this.player.y + 30);
      const idle = `idle-${this.facing}`;
      if (this.player.anims.currentAnim?.key !== idle) this.player.play(idle, true);
      return;
    }

    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown || this.wasd.a.isDown) vx -= 1;
    if (this.cursors.right.isDown || this.wasd.d.isDown) vx += 1;
    if (this.cursors.up.isDown || this.wasd.w.isDown) vy -= 1;
    if (this.cursors.down.isDown || this.wasd.s.isDown) vy += 1;

    const joy = this.joystick.vector;
    vx += joy.x;
    vy += joy.y;

    const len = Math.hypot(vx, vy);
    if (len > 1) {
      vx /= len;
      vy /= len;
    }

    this.player.setVelocity(vx * SPEED, vy * SPEED);
    this.playerShadow.setPosition(this.player.x, this.player.y + 30);
    this.updatePlayerAnim(vx, vy, len);

    this.updateNearest();
    this.compass.update({
      playerX: this.player.x,
      playerY: this.player.y,
      pois: this.pois,
      focusedId: this.focusedId,
      visited: this.visited,
    });

    if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      this.tryInteract();
    }

    // Bearing arrow in world toward focused POI
    if (this.focusedId) {
      const target = this.pois.find((p) => p.id === this.focusedId);
      if (target) {
        const ang = Phaser.Math.Angle.Between(
          this.player.x,
          this.player.y,
          target.x,
          target.y,
        );
        this.bearingArrow.setVisible(true);
        this.bearingArrow.setPosition(this.player.x, this.player.y - 52);
        this.bearingArrow.setRotation(ang + Math.PI / 2);
      }
    } else {
      this.bearingArrow.setVisible(false);
    }
  }

  shutdown(): void {
    this.joystick?.destroy();
    this.compass?.destroy();
  }

  private drawWorld(): void {
    drawUruguayMap(this, this.pois);
  }

  private spawnPois(): void {
    for (const poi of this.pois) {
      const beacon = this.add.image(poi.x, poi.y - 8, 'poi').setDepth(5).setScale(0.9);
      this.tweens.add({
        targets: beacon,
        y: poi.y - 16,
        duration: 1400,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });

      // Unique landmark icon per place
      const iconKey = `icon-${poi.id}`;
      if (this.textures.exists(iconKey)) {
        const icon = this.add.image(poi.x, poi.y - 58, iconKey).setDepth(6).setScale(1.15);
        this.tweens.add({
          targets: icon,
          y: poi.y - 64,
          duration: 1600,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
        });
      }

      // Pedestal
      const totem = this.add.graphics().setDepth(4);
      totem.fillStyle(poi.color, 0.88);
      totem.fillRoundedRect(poi.x - 10, poi.y - 48, 20, 36, 5);
      totem.fillStyle(0xf4c430, 0.9);
      totem.fillCircle(poi.x, poi.y - 52, 6);

      const label = this.add
        .text(poi.x, poi.y + 32, labelForPoi(poi), {
          fontFamily: 'DM Sans, system-ui',
          fontSize: '13px',
          fontStyle: '600',
          color: '#f7f2e9',
          backgroundColor: 'rgba(11,18,32,0.82)',
          padding: { x: 10, y: 6 },
          align: 'center',
        })
        .setOrigin(0.5, 0)
        .setDepth(7);
      const bounds = label.getBounds();
      this.add
        .rectangle(bounds.centerX, bounds.centerY, bounds.width + 6, bounds.height + 4, 0x0b1220, 0.25)
        .setDepth(6.5);
    }
  }

  private updatePlayerAnim(vx: number, vy: number, len: number): void {
    if (len > 0.08) {
      if (Math.abs(vx) > Math.abs(vy)) {
        this.facing = vx < 0 ? 'left' : 'right';
      } else {
        this.facing = vy < 0 ? 'up' : 'down';
      }
      const walk = `walk-${this.facing}`;
      if (this.player.anims.currentAnim?.key !== walk) {
        this.player.play(walk, true);
      }
    } else {
      const idle = `idle-${this.facing}`;
      if (this.player.anims.currentAnim?.key !== idle) {
        this.player.play(idle, true);
      }
    }
  }

  private addAmbientFx(): void {
    // Light inland dust only (avoid sparkle band that looked like a mystery UI strip)
    const dust = this.add.particles(0, 0, 'poi', {
      x: { min: 80, max: WORLD_SIZE - 80 },
      y: { min: 80, max: WORLD_SIZE * 0.5 },
      scale: { start: 0.06, end: 0 },
      alpha: { start: 0.18, end: 0 },
      speedY: { min: -6, max: -14 },
      speedX: { min: -8, max: 8 },
      lifespan: 3500,
      frequency: 320,
      blendMode: 'ADD',
      tint: 0xf4c430,
    });
    dust.setDepth(4);
  }

  private updateNearest(): void {
    let best: WorldPoi | null = null;
    let bestD = INTERACT_RADIUS;
    for (const poi of this.pois) {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, poi.x, poi.y);
      if (d < bestD) {
        bestD = d;
        best = poi;
      }
    }
    this.nearest = best;
    if (best) {
      this.prompt.setVisible(true);
      this.prompt.setPosition(this.player.x, this.player.y - 70);
      const seen = this.visited.has(best.id) ? ' · visto' : '';
      this.prompt.setText(`E · ${labelForPoi(best)}${seen}`);
      this.nearRing.setVisible(true);
      this.nearRing.setPosition(best.x, best.y);
      this.nearRing.setScale(1 + Math.sin(this.time.now / 200) * 0.04);
    } else {
      this.prompt.setVisible(false);
      this.nearRing.setVisible(false);
    }
  }

  private tryInteract(): void {
    if (this.placePanel.isOpen) {
      this.placePanel.hide();
      return;
    }
    if (this.nearest) {
      const id = this.nearest.id;
      const wasNew = !this.visited.has(id);
      gameAudio.discover();
      this.visited = markVisited(id);
      this.compass.setVisited(this.visited);
      this.refreshProgressUi();
      void this.placePanel.showPlace(id);
      if (wasNew) this.maybeCelebrateCompletion();
    }
  }

  private refreshProgressUi(): void {
    if (!this.progressLabel) return;
    const n = this.visited.size;
    const t = this.pois.length;
    this.progressLabel.textContent = `${n}/${t} lugares`;
    if (n >= t && t > 0) {
      this.progressLabel.classList.add('game-topbar__progress--done');
      this.progressLabel.textContent = `✓ ${t}/${t} completo`;
    }
  }

  private maybeCelebrateCompletion(): void {
    if (this.completionShown) return;
    if (this.visited.size < this.pois.length) return;
    this.completionShown = true;
    try {
      if (localStorage.getItem('conoceme-complete-toast') === '1') return;
      localStorage.setItem('conoceme-complete-toast', '1');
    } catch {
      /* show anyway */
    }
    const toast = document.createElement('div');
    toast.className = 'game-toast';
    toast.innerHTML = `
      <p><strong>Mapa completo.</strong> Recorriste los ${this.pois.length} capítulos de Uruguay.</p>
      <p class="game-toast__sub">El Faro sigue prendido si querés escribirme.</p>
    `;
    this.hudHost.append(toast);
    window.setTimeout(() => toast.classList.add('game-toast--show'), 30);
    window.setTimeout(() => {
      toast.classList.remove('game-toast--show');
      window.setTimeout(() => toast.remove(), 400);
    }, 5200);
  }
}
