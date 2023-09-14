export default class FlappyBirdScene extends Phaser.Scene {
  bird: Phaser.GameObjects.Sprite | null = null; // Create a bird property to hold our bird sprite
  tree: Phaser.GameObjects.Sprite | null = null; // Create a bird property to hold our bird sprite
  flippedTree: Phaser.GameObjects.Sprite | null = null; // Create a bird property to hold our bird sprite

  constructor() {
    super({ key: 'FlappyBirdScene' });
    this.addTreePair = this.addTreePair.bind(this);
  }

  resizeAssets() {
    const scaleFactorX = this.scale.width / 800; // 800 is the original width
    const scaleFactorY = this.scale.height / 600; // 600 is the original height

    if (this.bird) {
      this.bird.setScale(0.125 * scaleFactorX);
    }

    if (this.tree) {
      this.tree.setScale(0.125 * scaleFactorX);
    }
    if (this.flippedTree) {
      this.flippedTree.setScale(0.125 * scaleFactorX);
    }

    // Similarly, scale trees and other game assets...
  }

  addTreePair() {
    const tree = this.physics.add.image(800, 0, 'tree1'); // This will be our top tree
    const flippedTree = this.physics.add.image(800, 600, 'tree1'); // This remains as our bottom tree

    // Flip the top tree vertically
    tree.setFlipY(true);
    // Scale trees
    tree.setScale(0.35);
    flippedTree.setScale(0.35);

    // Set trees' vertical positions so they have a gap in between
    const gapPosition = Phaser.Math.Between(200, 400);
    const gapSize = 75; // The vertical gap size between trees

    tree.setY(300 - gapSize / 2 - tree.displayHeight * 0.5);
    flippedTree.setY(300 + gapSize / 2 + flippedTree.displayHeight * 0.5);

    // Set the trees to have a constant velocity moving left
    const speed = -200; // Negative for moving to the left
    tree.setVelocityX(speed);
    flippedTree.setVelocityX(speed);

    // Set up trees to be destroyed when they go off screen for memory management
    tree.once('offscreen', () => tree.destroy());
    flippedTree.once('offscreen', () => flippedTree.destroy());
  }

  preload() {
    this.load.image('birdup', '/flappy-birb/birdup.svg');
    this.load.image('birddown', '/flappy-birb/birddown.svg');
    for (let i = 1; i <= 1; i++) {
      this.load.image(`tree${i}`, `/flappy-birb/tree${i}.svg`);
    }
  }

  create() {
    // Creating an animation for the bird
    this.anims.create({
      key: 'flap',
      frames: [{ key: 'birdup' }, { key: 'birddown' }],
      frameRate: 3, // adjust this value to your liking for speed of animation
      repeat: -1, // infinite loop
    });

    this.time.addEvent({
      delay: 1000, // time in ms, e.g., 2000ms = 2s
      callback: this.addTreePair,
      callbackScope: this,
      loop: true,
    });

    // Adding the bird to the scene and starting the flapping animation
    this.bird = this.add.sprite(200, 300, 'birdup').play('flap');
    this.bird.setScale(0.125);

    this.scale.on('resize', (gameSize: any) => {
      this.resizeAssets();
    });
  }

  update() {
    // ... update logic
  }
}
