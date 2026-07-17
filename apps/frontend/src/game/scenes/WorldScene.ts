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
import type { PlacePanel } from '../../ui/placePanel';

export interface WorldSceneData {
  places: PlacesIndexDto;
  hudHost: HTMLElement;
  placePanel: PlacePanel;
  onExit?: () => void;
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
    // Offset slightly south of landmark so we don't spawn inside marker
    const sx = spawn.x;
    const sy = spawn.y + 40;

    this.add.image(sx, sy + 28, 'shadow').setDepth(1);
    this.player = this.physics.add.sprite(sx, sy, 'player');
    this.player.setDepth(10);
    this.player.setCollideWorldBounds(true);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setSize(28, 20);
    body.setOffset(10, 52);

    this.physics.world.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);
    this.cameras.main.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);
    this.cameras.main.setBackgroundColor('#4f7a58');

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      w: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.interactKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    this.joystick = new VirtualJoystick(this);

    this.compass = new CompassHud(this.hudHost);
    this.compass.setPois(this.pois);
    this.compass.setFocusHandler((id) => {
      this.focusedId = id;
    });

    this.prompt = this.add
      .text(0, 0, '', {
        fontFamily: 'DM Sans, system-ui, sans-serif',
        fontSize: '14px',
        color: '#f7f2e9',
        backgroundColor: 'rgba(11,18,32,0.75)',
        padding: { x: 10, y: 6 },
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
      .circle(this.cameras.main.width - 72, this.cameras.main.height - 100, 34, 0xe07a5f, 0.85)
      .setScrollFactor(0)
      .setDepth(1000)
      .setInteractive({ useHandCursor: true });
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

    const exitBtn = this.add
      .text(16, 16, '← Salir', {
        fontFamily: 'DM Sans, system-ui',
        fontSize: '14px',
        color: '#f7f2e9',
        backgroundColor: 'rgba(11,18,32,0.55)',
        padding: { x: 10, y: 6 },
      })
      .setScrollFactor(0)
      .setDepth(1000)
      .setInteractive({ useHandCursor: true });
    exitBtn.on('pointerdown', () => data.onExit?.());

    this.add
      .text(16, 48, 'WASD / flechas · E interactuar', {
        fontFamily: 'DM Sans, system-ui',
        fontSize: '12px',
        color: 'rgba(247,242,233,0.45)',
      })
      .setScrollFactor(0)
      .setDepth(1000);

    this.cameras.main.fadeIn(500, 11, 18, 32);
  }

  override update(): void {
    if (!this.player?.body) return;
    if (this.placePanel.isOpen) {
      this.player.setVelocity(0, 0);
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

    // Soft bob when moving
    if (len > 0.05) {
      this.player.setScale(1, 1 + Math.sin(this.time.now / 90) * 0.02);
    } else {
      this.player.setScale(1);
    }

    this.updateNearest();
    this.compass.update({
      playerX: this.player.x,
      playerY: this.player.y,
      pois: this.pois,
      focusedId: this.focusedId,
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
      const marker = this.add.image(poi.x, poi.y - 10, 'poi').setDepth(5);
      this.tweens.add({
        targets: marker,
        y: poi.y - 18,
        duration: 1400,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });

      // Title + what it's about (e.g. "La Rambla — Quién soy")
      const label = this.add
        .text(poi.x, poi.y + 30, labelForPoi(poi), {
          fontFamily: 'DM Sans, system-ui',
          fontSize: '13px',
          fontStyle: '600',
          color: '#f7f2e9',
          backgroundColor: 'rgba(11,18,32,0.78)',
          padding: { x: 10, y: 6 },
          align: 'center',
        })
        .setOrigin(0.5, 0)
        .setDepth(6);
      // Soft shadow plate behind label for contrast on sand/water
      const bounds = label.getBounds();
      this.add
        .rectangle(bounds.centerX, bounds.centerY, bounds.width + 4, bounds.height + 4, 0x0b1220, 0.2)
        .setDepth(5.5);

      // Landmark totem
      const totem = this.add.graphics().setDepth(4);
      totem.fillStyle(poi.color, 0.9);
      totem.fillRoundedRect(poi.x - 8, poi.y - 70, 16, 50, 4);
      totem.fillStyle(0xf4c430, 0.95);
      totem.fillCircle(poi.x, poi.y - 78, 10);
    }
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
      this.prompt.setText(`E · ${labelForPoi(best)}`);
    } else {
      this.prompt.setVisible(false);
    }
  }

  private tryInteract(): void {
    if (this.placePanel.isOpen) {
      this.placePanel.hide();
      return;
    }
    if (this.nearest) {
      void this.placePanel.showPlace(this.nearest.id);
    }
  }
}
