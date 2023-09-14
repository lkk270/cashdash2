export default class FlappyBirdScene extends Phaser.Scene {
  bird: Phaser.GameObjects.Sprite | null = null; // Create a bird property to hold our bird sprite
  flippedTree: Phaser.GameObjects.Sprite | null = null; // Create a bird property to hold our bird sprite
  gameStarted: boolean = false;

  constructor() {
    super({ key: 'FlappyBirdScene' });
    this.addTreePair = this.addTreePair.bind(this);
  }

  resizeAssets() {
    const scaleFactorX = this.scale.width / 800; // 800 is the original width
    // const scaleFactorY = this.scale.height / 600; // 600 is the original height

    if (this.bird) {
      this.bird.setScale(0.125 * scaleFactorX);
    }
  }

  addTreePair() {
    if (!this.gameStarted) {
      return; // Don't add trees unless the game has started
    }
    const gapSize = 60; // Adjusted this to increase the gap slightly
    const randomGapPosition = Phaser.Math.Between(gapSize * 2, this.scale.height - gapSize * 2);

    // Trunk Width
    const trunkWidth = 20;

    // Top Tree
    const topTreeHeight = randomGapPosition - gapSize / 2 - 60; // Deducted 40 to accommodate the size of the leaves.
    const topTree = this.add.graphics();
    topTree.fillStyle(0x64320b);
    topTree.fillRect(820 - trunkWidth / 2, 0, trunkWidth, topTreeHeight);

    const topLeaves = this.add.image(820 + 8, topTreeHeight, 'leaves');
    topLeaves.setScale(0.015);
    topLeaves.setAngle(180);

    // Bottom Tree
    const bottomTreeHeight = this.scale.height - (randomGapPosition + gapSize / 2 + 30); // Adjusted this to visually increase the gap.
    const bottomTree = this.add.graphics();
    bottomTree.fillStyle(0x64320b);
    bottomTree.fillRect(
      820 - trunkWidth / 2,
      randomGapPosition + gapSize / 2 + 30, // Added 20 to visually increase the gap.
      trunkWidth,
      bottomTreeHeight
    );

    const bottomNest = this.add.image(820, randomGapPosition + gapSize / 2 + 30, 'nest'); // Adjusted the Y position here
    bottomNest.setScale(0.25);

    // Add physics and movement logic similar to before
    this.physics.add.existing(topTree, false);
    this.physics.add.existing(topLeaves, false);
    this.physics.add.existing(bottomTree, false);
    this.physics.add.existing(bottomNest, false);

    (topTree.body as Phaser.Physics.Arcade.StaticBody).velocity.x = -200;
    (topLeaves.body as Phaser.Physics.Arcade.StaticBody).velocity.x = -200;
    (bottomTree.body as Phaser.Physics.Arcade.StaticBody).velocity.x = -200;
    (bottomNest.body as Phaser.Physics.Arcade.StaticBody).velocity.x = -200;

    this.time.addEvent({
      delay: 5000,
      callback: () => {
        topTree.destroy();
        topLeaves.destroy();
        bottomTree.destroy();
        bottomNest.destroy();
      },
      callbackScope: this,
      loop: false,
    });
  }

  // Rest of the file remains the same...

  preload() {
    this.load.image('birdup', '/flappy-birb/birdup.png');
    this.load.image('birddown', '/flappy-birb/birddown.png');
    this.load.image('nest', '/flappy-birb/nest.png');
    this.load.image('leaves', '/flappy-birb/leaves.png');
  }

  flap() {
    if (!this.gameStarted) {
      this.gameStarted = true;
      // Begin the game's main logic, such as starting tree generation or other mechanics.
      // Maybe start bird's gravity here, so it doesn't fall before the game starts.
    }

    if (this.bird) {
      (this.bird.body as Phaser.Physics.Arcade.Body).setVelocityY(-350); // Adjust the value for a smaller/bigger jump.
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
      delay: 1750, // time in ms, e.g., 2000ms = 2s
      callback: this.addTreePair,
      callbackScope: this,
      loop: true,
    });

    // Adding the bird to the scene and starting the flapping animation
    this.bird = this.add.sprite(200, 300, 'birdup').play('flap');
    this.bird.setScale(0.125);

    this.physics.add.existing(this.bird);
    (this.bird!.body as Phaser.Physics.Arcade.Body).setGravityY(300); // This makes the bird fall. Adjust the gravity value for faster/slower fall.

    this.scale.on('resize', (gameSize: any) => {
      this.resizeAssets();
    });

    this.input.on('pointerdown', this.flap, this);

    // Listen to space bar press
    if (this.input && this.input.keyboard) {
      this.input.keyboard.on('keydown-SPACE', this.flap, this);
    }
  }

  update() {
    if (this.bird && this.bird.y > this.scale.height) {
      this.bird.y = this.scale.height; // Put the bird on the ground.
      (this.bird.body as Phaser.Physics.Arcade.Body).setVelocityY(0); // Stop the bird from falling further.
      // Here you can also end the game or restart it, if you want.
    }
  }
}
