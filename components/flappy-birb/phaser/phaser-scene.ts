export default class FlappyBirdScene extends Phaser.Scene {
  bird: Phaser.GameObjects.Sprite | null = null; // Create a bird property to hold our bird sprite
  flippedTree: Phaser.GameObjects.Sprite | null = null; // Create a bird property to hold our bird sprite
  gameStarted: boolean = false;
  previousGapPosition: number | null = null;

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

    const gapSize = 70; // Adjusted this to increase the gap slightly
    let randomGapPosition;

    // Trunk Width
    const trunkWidth = 20;

    // If there was a previous gap, adjust the range for the new gap.
    if (window.innerWidth < 368) {
      // Detect if on mobile
      if (this.previousGapPosition !== null) {
        const minGapPosition = Math.max(gapSize * 2, this.previousGapPosition - 200);
        const maxGapPosition = Math.min(
          this.scale.height - gapSize * 2,
          this.previousGapPosition + 200
        );
        randomGapPosition = Phaser.Math.Between(minGapPosition, maxGapPosition);
      } else {
        randomGapPosition = Phaser.Math.Between(gapSize * 2, this.scale.height - gapSize * 2);
      }
    } else {
      randomGapPosition = Phaser.Math.Between(gapSize * 2, this.scale.height - gapSize * 2);
    }

    // Top Tree
    const topTreeHeight = randomGapPosition - gapSize / 2 - 70; // Deducted 40 to accommodate the size of the leaves.
    const topTree = this.add.graphics();
    topTree.fillStyle(0x64320b);
    topTree.fillRect(820 - trunkWidth / 2, 0, trunkWidth, topTreeHeight);

    const topLeaves = this.add.image(820 + 8, topTreeHeight, 'leaves');
    topLeaves.setScale(0.015);
    topLeaves.setAngle(180);

    // Bottom Tree
    const bottomTreeHeight = this.scale.height - (randomGapPosition + gapSize / 2 + 35); // Adjusted this to visually increase the gap.
    const bottomTree = this.add.graphics();
    bottomTree.fillStyle(0x64320b);
    bottomTree.fillRect(
      820 - trunkWidth / 2,
      randomGapPosition + gapSize / 2 + 35, // Added 20 to visually increase the gap.
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
    this.previousGapPosition = randomGapPosition;
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
      if (this.bird) {
        (this.bird.body as Phaser.Physics.Arcade.Body).setGravityY(1000); // Set gravity here
      }
    }

    const isMobile = window.innerWidth < 568;
    const jumpStrength = isMobile ? -350 : -275;

    if (this.bird) {
      (this.bird.body as Phaser.Physics.Arcade.Body).setVelocityY(jumpStrength);
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

    // Do not set gravity here, so the bird stays stationary
    // The gravity will be set in the flap() method when the game starts

    this.scale.on('resize', (gameSize: any) => {
      this.resizeAssets();
    });

    if (this.input && this.input.keyboard) {
      this.input.keyboard.on('keydown-SPACE', this.flap, this);
    }

    this.input.on('pointerdown', this.flap, this); // Add this if you want the bird to flap on a click/tap as well.
  }

  update() {
    if (this.bird) {
      if (this.bird.y > this.scale.height) {
        this.bird.y = this.scale.height;
        (this.bird.body as Phaser.Physics.Arcade.Body).setVelocityY(0);
      }
      if (this.bird.y < 0) {
        this.bird.y = 0;
        (this.bird.body as Phaser.Physics.Arcade.Body).setVelocityY(50); // Pushing it down a bit if it goes beyond the top
      }
    }
  }
}
