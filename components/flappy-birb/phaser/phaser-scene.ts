import gameEvents from './event-emitter';

const SCREEN_SIZE = window.innerWidth;
const MOBILE_SCREEN_WIDTH = 469;
const IS_MOBILE = SCREEN_SIZE > MOBILE_SCREEN_WIDTH ? false : true;
const JUMP_STRENGTH = IS_MOBILE ? -350 : -300;
const GAP_SIZE = IS_MOBILE ? 85 : 82;
const NORMAL_SPEED = IS_MOBILE ? 1950 : 1850;
const FAST_SPEED = IS_MOBILE ? 1550 : 1500;
export default class FlappyBirdScene extends Phaser.Scene {
  onGameStart: () => void;
  onGameEnd: (score: number) => void;
  bird: Phaser.GameObjects.Sprite | null = null; // Create a bird property to hold our bird sprite
  flippedTree: Phaser.GameObjects.Sprite | null = null; // Create a bird property to hold our bird sprite
  gameStarted: boolean = false;
  previousGapPosition: number | null = null;
  trees: Phaser.Physics.Arcade.Group | null = null;
  dragons: Phaser.Physics.Arcade.Group | null = null;
  leaves: Phaser.Physics.Arcade.Group | null = null;
  timerEvent: Phaser.Time.TimerEvent | null = null; // Define this at the class level
  score: number = 0;
  scoreText: Phaser.GameObjects.Text | null = null;
  private startText: Phaser.GameObjects.Text | null = null;
  treesPassed: number = 0;
  destructionTimers: Phaser.Time.TimerEvent[] = [];
  private restartButton: Phaser.GameObjects.Text | null = null;
  gameOver: boolean = false;
  previousSpeedCheckScore: number;
  speedChangeThreshold: number = 0;
  nextSpeedChange: 'fast' | 'normal' = 'fast';
  intendedDelay: number | null = null;
  speedChanged: boolean = false;

  constructor(
    config: Phaser.Types.Scenes.SettingsConfig,
    onGameStart: () => void,
    onGameEnd: (score: number) => void
  ) {
    super({ key: 'FlappyBirdScene', ...config });
    this.addTreePair = this.addTreePair.bind(this);
    this.onGameStart = onGameStart;
    this.onGameEnd = onGameEnd;
    this.previousSpeedCheckScore = 0; // to track the last speed check score
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

    // const gapSize = window.innerWidth < 469 ? 90 : 70; // Adjusted this to increase the gap slightly
    let randomGapPosition;

    // Trunk Width
    const trunkWidth = 20;

    // Detect gap position logic based on previous gap and screen width
    // if (window.innerWidth < MOBILE_SCREEN_WIDTH) {
    //   if (this.previousGapPosition !== null) {
    //     const minGapPosition = Math.max(GAP_SIZE, this.previousGapPosition - 100);
    //     const maxGapPosition = Math.min(
    //       this.scale.height - GAP_SIZE * 2,
    //       this.previousGapPosition + 75
    //     );
    //     randomGapPosition = Phaser.Math.Between(minGapPosition, maxGapPosition);
    //   } else {
    //     randomGapPosition = Phaser.Math.Between(GAP_SIZE * 2, this.scale.height - GAP_SIZE * 2);
    //   }
    // } else {
    //   randomGapPosition = Phaser.Math.Between(GAP_SIZE * 2, this.scale.height - GAP_SIZE * 2);
    // }
    randomGapPosition = Phaser.Math.Between(GAP_SIZE * 2, this.scale.height - GAP_SIZE * 2);

    // Top Tree
    const topTreeHeight = randomGapPosition - GAP_SIZE / 2 - GAP_SIZE;
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
      // topLeaves.body.setSize(375, 300, true);
      // topLeaves.body.offset.x = 50;
      topLeaves.body.setCircle(165, 80, 110);
      // Replace 'desiredOffset' with the desired vertical offset.
    }
    // Bottom Tree
    const bottomTreeHeight = this.scale.height - (randomGapPosition + GAP_SIZE);
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

    const bottomDragon = this.add.image(820 - 30, randomGapPosition + GAP_SIZE / 2 + 30, 'dragon');
    bottomDragon.setScale(0.2);
    this.physics.add.existing(bottomDragon, false);
    if (bottomDragon.body instanceof Phaser.Physics.Arcade.Body) {
      // bottomDragon.body.setSize(300, 300, true);
      // bottomDragon.body.offset.y = 100;
      // bottomDragon.body.offset.x = 175;
      bottomDragon.body.setCircle(175, 150, 100);
      // Replace 'desiredOffset' with the desired vertical offset.
    }

    // Add them to their respective groups
    this.trees?.add(topTree);
    this.trees?.add(bottomTree);
    this.leaves?.add(topLeaves);
    this.dragons?.add(bottomDragon);

    // Set the physics velocity for movement

    (topTree.body as Phaser.Physics.Arcade.Body).velocity.x = -200;
    (topLeaves.body as Phaser.Physics.Arcade.Body).velocity.x = -200;
    (bottomTree.body as Phaser.Physics.Arcade.Body).velocity.x = -200;
    (bottomDragon.body as Phaser.Physics.Arcade.Body).velocity.x = -200;

    // Destruction logic after some time
    const destructionTimer = this.time.addEvent({
      delay: 5000,
      callback: () => {
        this.trees?.remove(topTree);
        topTree.destroy();
        this.trees?.remove(bottomTree);
        bottomTree.destroy();
        this.dragons?.remove(bottomDragon);
        bottomDragon.destroy();
        this.leaves?.remove(topLeaves);
        topLeaves.destroy();
      },
      callbackScope: this,
      loop: false,
    });
    this.destructionTimers.push(destructionTimer);

    this.previousGapPosition = randomGapPosition;

    // After adding the tree pair, check for a delay change
    if (this.intendedDelay !== null) {
      if (this.timerEvent) {
        this.timerEvent.remove(false);
      }
      this.timerEvent = this.time.addEvent({
        delay: this.intendedDelay,
        callback: this.addTreePair,
        callbackScope: this,
        loop: true,
      });
      this.intendedDelay = null; // Reset the intended delay
    }
  }

  // Rest of the file remains the same...

  preload() {
    this.load.image('birdup', '/flappy-birb/birdup.png');
    this.load.image('birddown', '/flappy-birb/birddown.png');
    this.load.image('leaves', '/flappy-birb/leaves3.png');
    this.load.image('dragon', '/flappy-birb/dragon.png');
    this.load.image('sky', '/flappy-birb/sky1.png');
  }
  flap() {
    if (this.gameOver) return;
    if (this.startText) {
      this.startText.setVisible(false);
    }
    if (!this.gameStarted) {
      if (this.onGameStart) {
        this.onGameStart();
      }
      this.gameStarted = true;
      if (this.bird) {
        (this.bird.body as Phaser.Physics.Arcade.Body).setGravityY(1000); // Set gravity here
      }
    }

    // const isMobile = window.innerWidth < 568;
    // alert(isMobile);
    // const jumpStrength = isMobile ? -350 : -275;

    if (this.bird) {
      (this.bird.body as Phaser.Physics.Arcade.Body).setVelocityY(JUMP_STRENGTH);
    }
  }

  create() {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    // const scaleFactor = 1; // adjust as needed
    // this.cameras.main.setZoom(1 / scaleFactor);

    // this.physics.world.createDebugGraphic();
    this.cleanUp();
    this.gameOver = false;
    this.add.image(centerX, centerY, 'sky').setScale(1.17);
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '20px',
      color: '#580d82',
      fontFamily: 'Arial Black',
    });
    this.scoreText.setDepth(1000);

    this.score = 0;
    this.treesPassed = 0;
    this.nextSpeedChange = 'fast'; // Set the next speed change to 'fast'
    this.speedChangeThreshold = Math.floor(Math.random() * 6) + 10; // Random value between 10 and 15 for the first speed change

    this.physics.world.gravity.y = 0; // This ensures that the world starts with no gravity each time the scene starts.

    this.trees = this.physics.add.group();
    this.dragons = this.physics.add.group();
    this.leaves = this.physics.add.group();
    // Creating an animation for the bird
    this.anims.create({
      key: 'flap',
      frames: [{ key: 'birdup' }, { key: 'birddown' }],
      frameRate: 3, // adjust this value to your liking for speed of animation
      repeat: -1, // infinite loop
    });

    this.timerEvent = this.time.addEvent({
      delay: NORMAL_SPEED,
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

    // this.scale.on('resize', (gameSize: any) => {
    //   this.resizeAssets();
    // });

    if (this.input && this.input.keyboard) {
      this.input.keyboard.on('keydown-SPACE', this.flap, this);
    }

    this.input.on('pointerdown', this.flap, this); // Add this if you want the bird to flap on a click/tap as well.
    this.physics.add.overlap(this.bird, this.trees, this.endGame, undefined, this);
    this.physics.add.overlap(this.bird, this.dragons, this.endGame, undefined, this);
    this.physics.add.overlap(this.bird, this.leaves, this.endGame, undefined, this);

    if (this.bird && this.bird.body) {
      const birdBody = this.bird.body as Phaser.Physics.Arcade.Body;
      birdBody.setGravityY(0); // Start with no gravity
      birdBody.setVelocity(0); // Start with no velocity
      // birdBody.setSize(250, 175, true);
      // birdBody.offset.x = 175;
      birdBody.setCircle(125, 160, 125);
    }

    this.startText = this.add
      .text(centerX, centerY, 'Press spacebar or tap to play', {
        fontSize: '24px',
        color: '#ffffff',
        fontFamily: 'Arial Black',
      })
      .setOrigin(0.5, 0.5);

    this.restartButton = this.add
      .text(centerX, centerY + 30, 'Restart', {
        fontSize: '20px',
        color: '#580d82',
        backgroundColor: '#429add',
        fontFamily: 'Arial Black',
        padding: { left: 10, right: 10, top: 5, bottom: 5 },
      })
      .setDepth(100000)
      .setOrigin(0.5, 0.5)
      .setVisible(false)
      .setInteractive({
        cursor: 'pointer',
      });
    this.restartButton.on('pointerdown', async () => {
      // Restarting the game scene
      this.scene.restart();
      if (this.startText) {
        this.startText.setVisible(true);
      }
    });

    // Optionally, you can make the button slightly bigger when hovered
    this.restartButton.on('pointerover', () => {
      if (this.restartButton) {
        this.restartButton.setScale(1.1);
      }
    });

    this.restartButton.on('pointerout', () => {
      if (this.restartButton) {
        this.restartButton.setScale(1);
      }
    });

    gameEvents.on('gameEnded', () => {
      this.showRestartButton();
    });
    this.switchToNormalSpeed(); // Ensure you start with a normal speed timer.
    this.gameStarted = false; // Ensure the game starts from the beginning
  }
  showRestartButton() {
    if (this.restartButton) {
      this.restartButton.setVisible(true);
    }
  }

  pulseCompleted() {
    this.events.emit('pulseDone');
  }

  checkSpeedUpdate() {
    if (this.score >= this.speedChangeThreshold && !this.speedChanged) {
      if (this.nextSpeedChange === 'fast') {
        this.switchToFastSpeed();
        this.nextSpeedChange = 'normal'; // Indicate the next speed change
      } else if (this.nextSpeedChange === 'normal') {
        this.switchToNormalSpeed();
        this.nextSpeedChange = 'fast'; // Indicate the next speed change
      }
      this.speedChanged = true;
    } else if (this.score < this.speedChangeThreshold) {
      this.speedChanged = false; // Reset flag once the score goes below threshold
    }

    this.previousSpeedCheckScore = this.score; // Update the score at which the last speed change might have happened
  }

  switchToFastSpeed() {
    this.intendedDelay = FAST_SPEED;
    this.speedChangeThreshold = this.previousSpeedCheckScore + 8;
  }

  switchToNormalSpeed() {
    this.intendedDelay = NORMAL_SPEED;
    this.speedChangeThreshold = this.previousSpeedCheckScore + (Math.floor(Math.random() * 6) + 10);
  }
  update() {
    if (this.bird) {
      const bird = this.bird; // Define it here to reassure TypeScript that it's non-null
      this.trees?.getChildren().forEach((tree: any) => {
        if (tree.body.velocity.x < 0 && tree.x + tree.width < bird.x && !tree['passed']) {
          tree['passed'] = true;
          this.treesPassed += 1;

          if (this.treesPassed % 2 === 0) {
            this.score += 1;
            this.scoreText?.setText('Score: ' + this.score);
          }
        }
      });

      if (bird.y > this.scale.height) {
        this.endGame();
      }
      if (bird.y < 0) {
        bird.y = 0;
        (bird.body as Phaser.Physics.Arcade.Body).setVelocityY(50); // Pushing it down a bit if it goes beyond the top
      }
    }
    // Adjust timerEvent delay based on the score
    this.checkSpeedUpdate();
  }

  cleanUp() {
    if (this.restartButton) {
      this.restartButton.destroy();
      this.restartButton = null;
    }
    if (this.scoreText) {
      this.scoreText.setPosition(16, 16); // Reset score text position
    }
    if (this.timerEvent) {
      this.timerEvent.destroy();
    }
  }

  endGame() {
    if (this.gameOver === true) return;

    if (this.score === 0) {
      this.showRestartButton();
    }
    if (this.score > 0) {
      this.onGameEnd(this.score);
    }

    this.gameOver = true;
    for (const timer of this.destructionTimers) {
      timer.destroy();
    }
    this.destructionTimers = [];
    // Destroy the timer if it exists
    this.timerEvent?.destroy();

    // Placeholder for now, can add more logic later

    if (this.bird && this.bird.body) {
      const birdBody = this.bird.body as Phaser.Physics.Arcade.Body;
      birdBody.setVelocity(0); // Reset velocity
      birdBody.setGravityY(0); // Reset individual gravity
    }

    // Stop motion of all objects
    this.trees?.getChildren().forEach((tree: any) => {
      (tree.body as Phaser.Physics.Arcade.Body).setVelocityX(0);
    });

    this.leaves?.getChildren().forEach((leaf: any) => {
      (leaf.body as Phaser.Physics.Arcade.Body).setVelocityX(0);
    });

    this.dragons?.getChildren().forEach((dragon: any) => {
      (dragon.body as Phaser.Physics.Arcade.Body).setVelocityX(0);
    });

    this.gameStarted = false; // Ensure the game doesn't start immediately

    // Center the score text and display the restart button
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    if (this.scoreText) {
      this.scoreText.setBackgroundColor('#5fa6f9');
      this.tweens.add({
        targets: this.scoreText,
        x: centerX - this.scoreText.width / 2,
        y: centerY - this.scoreText.height / 2,
        duration: 1000,
        ease: 'Power2',
      });
    }
    this.score = 0;
    this.treesPassed = 0;
    this.nextSpeedChange = 'fast'; // Set the next speed change to 'fast'
    this.speedChangeThreshold = Math.floor(Math.random() * 6) + 10; // Random value between 10 and 15 for the first speed change
  }
}
