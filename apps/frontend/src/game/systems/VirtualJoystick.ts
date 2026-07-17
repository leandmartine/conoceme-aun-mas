import Phaser from 'phaser';

/**
 * Touch joystick (bottom-left). Returns normalized vector in [-1,1].
 */
export class VirtualJoystick {
  private base: Phaser.GameObjects.Arc;
  private knob: Phaser.GameObjects.Arc;
  private pointerId: number | null = null;
  private origin = new Phaser.Math.Vector2();
  private value = new Phaser.Math.Vector2();
  private readonly maxRadius = 52;
  private readonly baseRadius = 60;

  constructor(private readonly scene: Phaser.Scene) {
    const cam = scene.cameras.main;
    const x = 88;
    const y = cam.height - 100;

    this.base = scene.add
      .circle(x, y, this.baseRadius, 0xffffff, 0.1)
      .setStrokeStyle(2, 0xf7f2e9, 0.25)
      .setScrollFactor(0)
      .setDepth(1000)
      .setInteractive({ draggable: false, useHandCursor: false });

    this.knob = scene.add
      .circle(x, y, 28, 0xe07a5f, 0.75)
      .setScrollFactor(0)
      .setDepth(1001);

    this.origin.set(x, y);

    scene.input.on('pointerdown', this.onDown, this);
    scene.input.on('pointermove', this.onMove, this);
    scene.input.on('pointerup', this.onUp, this);
    scene.input.on('pointerupoutside', this.onUp, this);

    // Hide on pure desktop until touch is detected
    if (!scene.sys.game.device.input.touch) {
      this.base.setVisible(false);
      this.knob.setVisible(false);
    }
  }

  get vector(): Phaser.Math.Vector2 {
    return this.value.clone();
  }

  destroy(): void {
    this.scene.input.off('pointerdown', this.onDown, this);
    this.scene.input.off('pointermove', this.onMove, this);
    this.scene.input.off('pointerup', this.onUp, this);
    this.scene.input.off('pointerupoutside', this.onUp, this);
    this.base.destroy();
    this.knob.destroy();
  }

  private onDown(pointer: Phaser.Input.Pointer): void {
    if (this.pointerId !== null) return;
    // Only left half / near joystick area for multi-touch friendliness
    if (pointer.x > this.scene.cameras.main.width * 0.45) return;

    this.base.setVisible(true);
    this.knob.setVisible(true);
    this.pointerId = pointer.id;
    this.origin.set(pointer.x, pointer.y);
    this.base.setPosition(pointer.x, pointer.y);
    this.knob.setPosition(pointer.x, pointer.y);
  }

  private onMove(pointer: Phaser.Input.Pointer): void {
    if (pointer.id !== this.pointerId) return;
    const dx = pointer.x - this.origin.x;
    const dy = pointer.y - this.origin.y;
    const len = Math.hypot(dx, dy) || 1;
    const clamped = Math.min(len, this.maxRadius);
    const nx = (dx / len) * clamped;
    const ny = (dy / len) * clamped;
    this.knob.setPosition(this.origin.x + nx, this.origin.y + ny);
    this.value.set(nx / this.maxRadius, ny / this.maxRadius);
  }

  private onUp(pointer: Phaser.Input.Pointer): void {
    if (pointer.id !== this.pointerId) return;
    this.pointerId = null;
    this.value.set(0, 0);
    this.knob.setPosition(this.origin.x, this.origin.y);
  }
}
