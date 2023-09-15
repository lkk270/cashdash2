export default class FlappyBirdScene extends Phaser.Scene {
  bird: Phaser.GameObjects.Sprite | null = null; // Create a bird property to hold our bird sprite
  flippedTree: Phaser.GameObjects.Sprite | null = null; // Create a bird property to hold our bird sprite
  gameStarted: boolean = false;
  previousGapPosition: number | null = null;
  trees: Phaser.Physics.Arcade.Group | null = null;
  nests: Phaser.Physics.Arcade.Group | null = null;
  leaves: Phaser.Physics.Arcade.Group | null = null;
  timerEvent: Phaser.Time.TimerEvent | null = null; // Define this at the class level

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

    // Detect gap position logic based on previous gap and screen width
    if (window.innerWidth < 368) {
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
    const topTreeHeight = randomGapPosition - gapSize / 2 - 70;
    const topTree = this.add.rectangle(
      820 - trunkWidth / 2,
      topTreeHeight / 2,
      trunkWidth,
      topTreeHeight,
      0x64320b
    );
    this.physics.add.existing(topTree, false);

    // Adjusting the tree trunk's hitbox to avoid overlaps
    if (topTree.body instanceof Phaser.Physics.Arcade.Body) {
      topTree.body.setSize(trunkWidth, topTreeHeight, true);
      //   topTree.body.offset.y = 0;

      // Replace 'someValue' with the amount of pixels you want to reduce from the bottom.
    }

    const topLeaves = this.add.image(820 - 15, topTreeHeight, 'leaves');
    topLeaves.setScale(0.25);
    topLeaves.setAngle(180);
    this.physics.add.existing(topLeaves, false);
    if (topLeaves.body instanceof Phaser.Physics.Arcade.Body) {
      topLeaves.body.setSize(375, 300, true);
      topLeaves.body.offset.x = 50;
      // Replace 'desiredOffset' with the desired vertical offset.
    }
    // Bottom Tree
    const bottomTreeHeight = this.scale.height - (randomGapPosition + gapSize / 2 + 35);
    const bottomTree = this.add.rectangle(
      820 - trunkWidth / 2,
      this.scale.height - bottomTreeHeight / 2,
      trunkWidth,
      bottomTreeHeight,
      0x64320b
    );
    this.physics.add.existing(bottomTree, false);

    // Adjusting the tree trunk's hitbox to avoid overlaps
    if (bottomTree.body instanceof Phaser.Physics.Arcade.Body) {
      bottomTree.body.setSize(trunkWidth, bottomTreeHeight, true);
      bottomTree.body.offset.y = 25;
      // Replace 'someValue' with the amount of pixels you want to reduce from the top.
    }

    const bottomNest = this.add.image(820, randomGapPosition + gapSize / 2 + 30, 'nest');
    bottomNest.setScale(0.25);
    this.physics.add.existing(bottomNest, false);
    if (bottomNest.body instanceof Phaser.Physics.Arcade.Body) {
      bottomNest.body.setSize(300, 220, true);
      bottomNest.body.offset.y = 175;
      // Replace 'desiredOffset' with the desired vertical offset.
    }

    // Add them to their respective groups
    this.trees?.add(topTree);
    this.trees?.add(bottomTree);
    this.leaves?.add(topLeaves);
    this.nests?.add(bottomNest);

    // Set the physics velocity for movement

    (topTree.body as Phaser.Physics.Arcade.Body).velocity.x = -200;
    (topLeaves.body as Phaser.Physics.Arcade.Body).velocity.x = -200;
    (bottomTree.body as Phaser.Physics.Arcade.Body).velocity.x = -200;
    (bottomNest.body as Phaser.Physics.Arcade.Body).velocity.x = -200;

    // Destruction logic after some time
    this.time.addEvent({
      delay: 5000,
      callback: () => {
        this.trees?.remove(topTree);
        topTree.destroy();
        this.trees?.remove(bottomTree);
        bottomTree.destroy();
        this.nests?.remove(bottomNest);
        bottomNest.destroy();
        this.leaves?.remove(topLeaves);
        topLeaves.destroy();
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
    this.load.image('leaves', '/flappy-birb/leaves3.png');
  }
  flap() {
    if (!this.gameStarted) {
      this.gameStarted = true;
      if (this.bird) {
        (this.bird.body as Phaser.Physics.Arcade.Body).setGravityY(1000); // Set gravity here
      }
    }

    const isMobile = window.innerWidth < 568;
    // alert(isMobile);
    const jumpStrength = isMobile ? -350 : -275;

    if (this.bird) {
      (this.bird.body as Phaser.Physics.Arcade.Body).setVelocityY(jumpStrength);
    }
  }

  create() {
    this.physics.world.createDebugGraphic();
    this.physics.world.gravity.y = 0; // This ensures that the world starts with no gravity each time the scene starts.

    this.trees = this.physics.add.group();
    this.nests = this.physics.add.group();
    this.leaves = this.physics.add.group();
    // Creating an animation for the bird
    this.anims.create({
      key: 'flap',
      frames: [{ key: 'birdup' }, { key: 'birddown' }],
      frameRate: 3, // adjust this value to your liking for speed of animation
      repeat: -1, // infinite loop
    });

    this.timerEvent = this.time.addEvent({
      delay: 1750,
      callback: this.addTreePair,
      callbackScope: this,
      loop: true,
    });

    // Adding the bird to the scene and starting the flapping animation
    this.bird = this.add.sprite(200, 300, 'birdup').play('flap');
    this.bird.setScale(0.125);

    this.physics.add.existing(this.bird);
    (this.bird.body as Phaser.Physics.Arcade.Body).setImmovable(false);

    // Do not set gravity here, so the bird stays stationary
    // The gravity will be set in the flap() method when the game starts

    this.scale.on('resize', (gameSize: any) => {
      this.resizeAssets();
    });

    if (this.input && this.input.keyboard) {
      this.input.keyboard.on('keydown-SPACE', this.flap, this);
    }

    this.input.on('pointerdown', this.flap, this); // Add this if you want the bird to flap on a click/tap as well.
    this.physics.add.overlap(this.bird, this.trees, this.endGame, undefined, this);
    this.physics.add.overlap(this.bird, this.nests, this.endGame, undefined, this);
    this.physics.add.overlap(this.bird, this.leaves, this.endGame, undefined, this);

    if (this.bird && this.bird.body) {
      const birdBody = this.bird.body as Phaser.Physics.Arcade.Body;
      birdBody.setGravityY(0); // Start with no gravity
      birdBody.setVelocity(0); // Start with no velocity
      birdBody.setSize(250, 175, true);
      birdBody.offset.x = 175;
    }

    this.gameStarted = false; // Ensure the game starts from the beginning
  }

  update() {
    if (this.bird) {
      if (this.bird.y > this.scale.height) {
        this.endGame();
      }
      if (this.bird.y < 0) {
        this.bird.y = 0;
        (this.bird.body as Phaser.Physics.Arcade.Body).setVelocityY(50); // Pushing it down a bit if it goes beyond the top
      }
    }
  }
  endGame() {
    this.timerEvent?.destroy(); // Destroy the timer if it exists

    // Placeholder for now, can add more logic later
    console.log('Game Over!');
    this.scene.restart();
    if (this.bird && this.bird.body) {
      const birdBody = this.bird.body as Phaser.Physics.Arcade.Body;
      birdBody.setVelocity(0); // Reset velocity
      birdBody.setGravityY(0); // Reset individual gravity
    }

    this.gameStarted = false; // Ensure the game starts from the beginning
    this.scene.restart();
  }
}
