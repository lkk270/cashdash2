import gameEvents from './event-emitter';
// const CHIPS = [
//   { name: 'c1', value: 1 },
//   { name: 'c5', value: 5 },
//   { name: 'c25', value: 25 },
//   { name: 'c50', value: 50 },
//   { name: 'c100', value: 100 },
//   { name: 'c1000', value: 1000 },
// ];

// const CHIP_OFFSETS = [0, -5, -10];

// Home Screen Scene
// class HomeScene extends Phaser.Scene {
//   onGameStart: () => void;

//   constructor(config: Phaser.Types.Scenes.SettingsConfig, onGameStart: () => void) {
//     super({ key: 'HomeScene', ...config });
//     this.onGameStart = onGameStart;
//   }

//   create() {
//     this.add
//       .text(400, 150, 'Welcome to Blackjack', { fontSize: '32px', align: 'center' })
//       .setOrigin(0.5);

//     const playButton = this.add.text(400, 300, 'Play', { fontSize: '24px' }).setOrigin(0.5);
//     playButton.setInteractive();

//     playButton.on('pointerdown', () => {
//       this.scene.start('BlackjackScene');
//     });
//   }
// }

const CHIPS = [
  { name: 'c1', value: 1, originalX: 101, originalY: 541 },
  { name: 'c5', value: 5, originalX: 238, originalY: 541 },
  { name: 'c25', value: 25, originalX: 375, originalY: 541 },
  { name: 'c50', value: 50, originalX: 512, originalY: 541 },
  { name: 'c100', value: 100, originalX: 101, originalY: 678 },
  { name: 'c1000', value: 1000, originalX: 238, originalY: 678 },
  { name: 'c2000', value: 2000, originalX: 375, originalY: 678 },
];

const PLACED_CHIP_X = 405;
const CENTER_Y = 375;
const PLACED_CHIP_X_MULTIPLIER = 2.5;

const CHIP_OFFSETS = [0, -5, -10];

// Game Scene
class BlackjackScene extends Phaser.Scene {
  onGameStart: () => void;
  onGameEnd: (score: number) => void;
  private balance: number = 99999;
  private balanceText: Phaser.GameObjects.Text | null = null;
  private chipCounts: Map<number, number> = new Map();
  private chips: Phaser.GameObjects.Sprite[] = [];
  private selectedChips: Phaser.GameObjects.Sprite[] = [];
  private lastSelectedChipXPosition: number = PLACED_CHIP_X;
  private selectedChipsTotalText: Phaser.GameObjects.Text | null = null;
  private canSelectChip: boolean = true;
  private canDeselectChip: boolean = true;
  private mainContainer: Phaser.GameObjects.Container | null = null;
  private mainBackground: Phaser.GameObjects.Graphics | null = null;
  private allInButton: Phaser.GameObjects.Container | null = null;
  private clearBetButton: Phaser.GameObjects.Container | null = null;
  private dealButton: Phaser.GameObjects.Container | null = null;
  private dealInProgress = false;
  private cards: string[] = [];
  private hitButton: Phaser.GameObjects.Container | null = null;
  private standButton: Phaser.GameObjects.Container | null = null;
  private doubleDownButton: Phaser.GameObjects.Container | null = null;
  private splitButton: Phaser.GameObjects.Container | null = null;
  private dealerCardValue: number = 0;
  private playerCardValue: number = 0;

  constructor(
    config: Phaser.Types.Scenes.SettingsConfig,
    onGameStart: () => void,
    onGameEnd: (score: number) => void
  ) {
    super({ key: 'BlackjackScene', ...config });
    this.onGameStart = onGameStart;
    this.onGameEnd = onGameEnd;
    // Add this line

    // this.mainContainer = this.add.container();
  }

  preload() {
    this.load.image('bg', '/blackjack/casinotablebg.png');
    this.load.atlas('cards', '/blackjack/cards.png', '/blackjack/cards.json');
    this.load.atlas('chips', '/blackjack/chips3.png', '/blackjack/chips3.json');
  }

  formatBalance(balance: number): string {
    if (balance <= 9999) {
      return balance.toString();
    } else if (balance >= 995_000 && balance < 1_000_000) {
      return '1M';
    } else if (balance < 1_000_000) {
      return (Math.round(balance / 100) / 10 + 'K').toString();
    } else if (balance < 1_000_000_000) {
      return (Math.round(balance / 100_000) / 10 + 'M').toString();
    } else {
      return (Math.round(balance / 100_000_000) / 10 + 'B').toString();
    }
  }

  // Function to update the visibility of the chips based on the balance
  updateAvailableChips(chips: Phaser.GameObjects.Sprite[]) {
    chips.forEach((chip, index) => {
      if (CHIPS[index].value > this.balance) {
        // If chip value is more than remaining balance, hide it with an animation
        this.tweens.add({
          targets: chip,
          alpha: 0, // fade out
          duration: 300, // 300ms
          onComplete: () => {
            chip.visible = false;
          },
        });
      } else {
        // If chip value is less than or equal to balance and it's currently not visible, show it
        if (!chip.visible) {
          chip.visible = true;
          this.tweens.add({
            targets: chip,
            alpha: 1, // fade in
            duration: 300, // 300ms
          });
        }
      }
    });
  }

  deselectChip(clonedChip: Phaser.GameObjects.Sprite) {
    if (!this.canDeselectChip || this.dealInProgress) return;
    this.canDeselectChip = false;
    setTimeout(() => {
      this.canDeselectChip = true;
    }, 300);

    const chipIndex = this.selectedChips.indexOf(clonedChip);
    if (chipIndex !== -1) {
      this.selectedChips.splice(chipIndex, 1);
    }

    const chipValue = CHIPS.find((chipData) => chipData.name === clonedChip.frame.name)?.value;
    if (chipValue) {
      this.balance += chipValue;
      const currentCount = this.chipCounts.get(chipValue) || 0;
      this.chipCounts.set(chipValue, Math.max(0, currentCount - 1));
    }

    if (this.balanceText) {
      this.balanceText.setText(`Bank: $${this.formatBalance(this.balance)}`);
    }

    this.tweens.add({
      targets: clonedChip,
      x: (clonedChip as any).originalX,
      y: (clonedChip as any).originalY,
      duration: 300,
      ease: 'Sine.easeOut',
      onComplete: () => {
        clonedChip.destroy();
        this.updateAvailableChips(this.chips);
      },
    });
    console.log('INN 167');

    this.updateSelectedChipsTotal();
  }

  updateSelectedChipsTotal() {
    let total = 0;
    this.selectedChips.forEach((chip) => {
      const chipValue = CHIPS.find((chipObj) => chipObj.name === chip.frame.name)?.value;
      if (chipValue) {
        total += chipValue;
      }
    });

    if (this.selectedChipsTotalText) {
      this.selectedChipsTotalText.setText(`$${this.formatBalance(total)}`);
    }
    if (this.selectedChipsTotalText?.text === '$0') {
      this.dealButton?.setVisible(false);
    } else {
      this.dealButton?.setVisible(true);
    }
  }

  betAllIn() {
    // Temp array to hold all the chips that would be added
    const tempChips: { chipObj: any; clonedChip: Phaser.GameObjects.Sprite }[] = [];

    // Calculate all the chips we would be adding
    while (this.balance > 0) {
      const chipObj = CHIPS.slice()
        .reverse()
        .find((chip) => chip.value <= this.balance);
      if (!chipObj) {
        break;
      }
      this.balance -= chipObj.value;
      const clonedChip = this.add
        .sprite(chipObj.originalX, chipObj.originalY, 'chips', chipObj.name)
        .setScale(0.42);

      clonedChip
        .setInteractive({
          cursor: 'pointer',
        })
        .on('pointerdown', () => {
          console.log('HELLO');
          this.deselectChip(clonedChip);
        });
      tempChips.push({ chipObj, clonedChip });
    }

    // Animate them to the center individually
    tempChips.forEach((item, idx) => {
      const chipObj = item.chipObj;
      const clonedChip = item.clonedChip;
      clonedChip.x = this.lastSelectedChipXPosition;
      clonedChip.y = CENTER_Y + idx * 2.5; // Stacking chips
      (clonedChip as any).originalX = chipObj.originalX;
      (clonedChip as any).originalY = chipObj.originalY;

      this.selectedChips.push(clonedChip);
      this.tweens.add({
        targets: clonedChip,
        x: this.lastSelectedChipXPosition,
        y: CENTER_Y, // Adjust this to make them stack nicely in the center
        duration: 300,
        ease: 'Sine.easeOut',
        delay: idx * 100, // Add a small delay to each to make it more realistic
      });
    });

    if (this.balanceText) {
      this.balanceText.setText(`Bank: $${this.formatBalance(this.balance)}`);
    }
    this.updateSelectedChipsTotal();
    this.updateAvailableChips(this.chips);
  }

  clearAllBets() {
    // Refund balance based on selected chips and animate them back to their positions
    this.selectedChips.forEach((chip) => {
      const chipObj = CHIPS.find((chipObj) => chipObj.name === chip.frame.name);
      const chipValue = chipObj?.value;
      const originalX = chipObj?.originalX;
      const originalY = chipObj?.originalY;
      if (chipValue) {
        this.balance += chipValue;
        this.tweens.add({
          targets: chip,
          x: originalX,
          y: originalY,
          duration: 300,
          ease: 'Sine.easeOut',
          onComplete: () => {
            chip.destroy();
          },
        });
      }
    });

    this.selectedChips = []; // Clear the array

    if (this.balanceText) {
      this.balanceText.setText(`Bank: $${this.formatBalance(this.balance)}`);
    }
    console.log('INN 292');

    this.updateSelectedChipsTotal();
    this.updateAvailableChips(this.chips);
  }

  createRoundedBackground(scene: Phaser.Scene): Phaser.GameObjects.Graphics {
    const graphics = scene.add.graphics();
    // Define color
    graphics.fillStyle(0x11354f, 1);
    // Draw rounded rectangles
    graphics.fillRoundedRect(20, 340, 575 / 2.75, 125, 10);
    graphics.fillRoundedRect(20, 440, 575, 310, 10);

    scene.add.existing(graphics);
    return graphics;
  }

  createAllInButton() {
    if (this.balance < 100000) {
      const x = 125;
      const y = 415;
      const width = 175;
      const height = 40;
      this.allInButton = this.createButton(x, y, 'All In', width, height);
      this.allInButton.setVisible(true);
      this.allInButton.on('pointerdown', () => {
        this.betAllIn();
        this.allInButton?.setVisible(false);
        this.clearBetButton?.setVisible(true);
      });
    }
  }

  createClearBetButton() {
    if (this.balance < 100000) {
      const x = 125;
      const y = 415;
      const width = 175;
      const height = 40;
      this.clearBetButton = this.createButton(x, y, 'Clear Bet', width, height);
      this.clearBetButton.setVisible(false);
      this.clearBetButton.on('pointerdown', () => {
        this.clearAllBets();
        this.clearBetButton?.setVisible(false);
        this.allInButton?.setVisible(true);
      });
    }
  }

  createDealButton() {
    const x = 625;
    const y = 300;
    const width = 175;
    const height = 80;
    this.dealButton = this.createButton(x, y, 'Deal', width, height);
    this.dealButton.setVisible(false);
    this.dealButton?.on('pointerdown', () => {
      this.dealInProgress = true;
      this.onDealButtonClicked();
    });
  }

  onDealButtonClicked() {
    this.dealButton?.setVisible(false);
    this.hitButton?.setVisible(true);
    this.standButton?.setVisible(true);
    this.createDoubleDownButton();

    // Animate balanceText to the top-left
    if (this.balanceText) {
      this.tweens.add({
        targets: this.balanceText,
        x: 10,
        y: 30,
        duration: 500,
        ease: 'Sine.easeInOut',
        onStart: () => {
          this.mainContainer?.setVisible(true);
        },
        onComplete: () => {
          // This can be left empty or add further actions if necessary
        },
      });
    }

    // Animate mainContainer moving downwards off the screen
    if (this.mainContainer) {
      this.tweens.add({
        targets: this.mainContainer,
        y: this.game.canvas.height + this.mainContainer.height, // moving it completely below the screen
        duration: 500,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          this.mainContainer?.setVisible(false); // Hide the container after the animation
        },
      });
    }

    // Animate allInButtonText moving downwards off the screen
    if (this.allInButton) {
      this.tweens.add({
        targets: this.allInButton,
        y: this.game.canvas.height + this.allInButton.height, // moving it completely below the screen
        duration: 500,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          this.allInButton?.setVisible(false); // Hide the text after the animation
        },
      });
    }
    if (this.clearBetButton) {
      this.tweens.add({
        targets: this.clearBetButton,
        y: this.game.canvas.height + this.clearBetButton.height, // moving it completely below the screen
        duration: 500,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          this.clearBetButton?.setVisible(false); // Hide the text after the animation
        },
      });
    }
    this.dealCards();
  }

  createChips() {
    this.chips = CHIPS.map((chipObj) => {
      const chip = this.add.sprite(0, 0, 'chips', chipObj.name).setScale(0.42);
      chip.setInteractive({
        cursor: 'pointer',
      });
      chip.visible = chipObj.value <= this.balance; // Initialize visibility

      chip.on('pointerdown', () => {
        if (!this.canSelectChip) return; // If we can't select, exit early
        this.canSelectChip = false; // Set it to false to prevent subsequent selections
        setTimeout(() => {
          this.canSelectChip = true; // Allow selections after a delay (in this case, 300ms)
        }, 600);
        // Create a clone of the clicked chip
        const clonedChip = this.add.sprite(chip.x, chip.y, 'chips', chipObj.name).setScale(0.42);
        // Add the cloned chip to the selected chips array
        (clonedChip as any).originalX = chip.x;
        (clonedChip as any).originalY = chip.y;

        this.selectedChips.push(clonedChip);

        this.updateSelectedChipsTotal();

        // Event to handle deselection of the chip
        clonedChip
          .setInteractive({
            cursor: 'pointer',
          })
          .on('pointerdown', () => {
            // Remove the chip from the array

            if (!this.canDeselectChip || this.dealInProgress) return; // If we can't deselect, exit early

            this.canDeselectChip = false; // Set it to false to prevent subsequent deselections
            setTimeout(() => {
              this.canDeselectChip = true; // Allow deselections after a delay (in this case, 300ms)
            }, 300);

            const chipIndex = this.selectedChips.indexOf(clonedChip);
            if (chipIndex !== -1) {
              this.selectedChips.splice(chipIndex, 1);
            }
            // Deselect and adjust the balance
            const chipValue = CHIPS.find(
              (chipData) => chipData.name === clonedChip.frame.name
            )?.value;
            if (chipValue) {
              this.balance += chipValue;
              const currentCount = this.chipCounts.get(chipValue) || 0;
              this.chipCounts.set(chipValue, Math.max(0, currentCount - 1)); // ensure it's not less than 0
            }
            if (this.balanceText) {
              this.balanceText.setText(`Bank: $${this.formatBalance(this.balance)}`);
            }

            // Update the total for the selected chips
            console.log('INN 503');

            this.updateSelectedChipsTotal();

            // Tween to animate the chip moving back to its designated pile
            this.tweens.add({
              targets: clonedChip,
              x: chip.x,
              y: chip.y,
              duration: 300, // Duration in milliseconds
              ease: 'Sine.easeOut', // The easing function to use
              onComplete: () => {
                clonedChip.destroy();
                this.updateAvailableChips(this.chips);
              },
            });
          });

        // const offset =
        //   CHIP_OFFSETS[centerChipCount] !== undefined ? CHIP_OFFSETS[centerChipCount] : -12;
        const centerChipCount = this.selectedChips.length;
        const targetX =
          centerChipCount < 8
            ? PLACED_CHIP_X - PLACED_CHIP_X_MULTIPLIER * centerChipCount
            : PLACED_CHIP_X - PLACED_CHIP_X_MULTIPLIER * 7;

        this.tweens.add({
          targets: clonedChip,
          x: targetX,
          y: CENTER_Y,
          duration: 300, // Duration in milliseconds
          ease: 'Sine.easeOut', // The easing function to use (this one is smooth)
          // onComplete: () => {
          //   if (centerChipCount < 3) {
          //     centerChipCount++;
          //   }
          // },
        });

        this.lastSelectedChipXPosition = targetX;
        const currentCount = this.chipCounts.get(chipObj.value) || 0;
        this.chipCounts.set(chipObj.value, currentCount + 1);

        // Deduct the chip value from the balance
        this.balance -= chipObj.value;
        if (this.balanceText) {
          this.balanceText.setText(`Bank: $${this.formatBalance(this.balance)}`);
        }
        this.updateAvailableChips(this.chips);
      });

      return chip;
    });
  }

  createButton(
    x: number,
    y: number,
    label: string,
    width = 100,
    height = 40,
    bgColor = 0x429add,
    textColor = '#580d82',
    fontSize = '20px',
    cornerRadius = 10
  ) {
    // Create a container for the button
    const buttonContainer = this.add.container(x, y);

    // Create rounded rectangle background using graphics
    const buttonBackground = this.add
      .graphics({ fillStyle: { color: bgColor } })
      .fillRoundedRect(-width / 2, -height / 2, width, height, cornerRadius);
    buttonContainer.add(buttonBackground); // Add background to the container

    // Create the text
    const buttonText = this.add
      .text(0, 0, label, {
        fontSize: fontSize,
        color: textColor,
        fontFamily: 'Arial Black',
        padding: { left: 10, right: 10, top: 5, bottom: 5 },
      })
      .setDepth(1000)
      .setOrigin(0.5, 0.5);
    buttonContainer.add(buttonText); // Add text to the container

    // Set interactivity to the container
    buttonContainer.setInteractive(
      new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
      Phaser.Geom.Rectangle.Contains
    );

    buttonContainer.on('pointerover', () => {
      this.game.canvas.style.cursor = 'pointer';

      buttonContainer.setScale(1.1);
    });

    buttonContainer.on('pointerout', () => {
      buttonContainer.setScale(1);
      this.game.canvas.style.cursor = 'default';
    });

    return buttonContainer; // Return the button container so you can apply further actions if needed
  }

  //cards

  createHitButton() {
    this.hitButton = this.createButton(250, 370, 'Hit');
    this.hitButton.setVisible(false);
    this.hitButton?.on('pointerdown', () => {});
  }

  createStandButton() {
    this.standButton = this.createButton(650, 370, 'Stand');
    this.standButton.setVisible(false);
    this.standButton?.on('pointerdown', () => {});
  }

  createDoubleDownButton() {
    this.doubleDownButton = this.createButton(
      this.lastSelectedChipXPosition,
      375,
      'Double',
      100,
      100,
      0x30b739,
      '#ffffff',
      '20px',
      50
    );
    this.doubleDownButton.setVisible(true);
    this.doubleDownButton.setDepth(1000);
    this.doubleDownButton?.on('pointerdown', () => {});
  }

  createSplitButton() {
    this.splitButton = this.createButton(650, 370, 'Split');
    this.splitButton.setVisible(false);
    this.splitButton?.on('pointerdown', () => {});
  }

  extractCardValue(frameName: string) {
    // Extracting the number or value part from the card name
    const valuePart = frameName.replace(/(clubs|diamonds|hearts|spades)/i, '');

    // Checking for number cards
    if (!isNaN(Number(valuePart))) {
      return [parseInt(valuePart)];
    }

    // Checking for face cards and Ace
    switch (valuePart) {
      case 'king':
      case 'queen':
      case 'jack':
        return [10];
      case 'ace':
        return [1, 11];
      default:
        return [];
    }
  }

  createDeck() {
    const frames = this.textures.get('cards').getFrameNames();
    let singleDeck = [];
    for (let i = 0; i < frames.length; i++) {
      const frameName = frames[i];
      if (frameName !== 'back' && frameName !== 'joker') {
        singleDeck.push(frameName);
      }
    }
    this.cards = singleDeck.concat(singleDeck); // Combining two decks
  }

  shuffleDeck() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  dealCards() {
    let playerCards = [this.cards.pop(), this.cards.pop()];
    let dealerCards = ['back', this.cards.pop()];
    this.displayCards(playerCards, 375, 600); // Coordinates for the player's cards
    this.displayCards(dealerCards, 375, 150); // Coordinates for the dealer's cards
  }

  displayCards(cards: any[], startX: number, startY: number) {
    for (let i = 0; i < cards.length; i++) {
      this.add.sprite(startX + i * 100, startY, 'cards', cards[i]);
    }
  }

  create() {
    this.createDeck();
    this.shuffleDeck();
    this.chipCounts.clear();

    this.add.image(420, CENTER_Y, 'bg');
    this.mainContainer = this.add.container();

    this.mainBackground = this.createRoundedBackground(this);
    this.mainContainer.add(this.mainBackground);
    // ALL IN Button
    this.createAllInButton();
    this.createClearBetButton();
    this.createHitButton();
    this.createStandButton();
    this.createSplitButton();
    //add available chips
    this.createChips();

    if (this.allInButton) {
      this.mainContainer.add(this.allInButton);
    }
    this.chips.forEach((chip) => {
      if (this.mainContainer) {
        this.mainContainer.add(chip);
      }
    });

    this.balanceText = this.add
      .text(30, 370, `Bank: $${this.formatBalance(this.balance)}`, {
        fontSize: '24px',
        fontStyle: 'bold',
      })
      .setOrigin(0, 0.5);

    this.selectedChipsTotalText = this.add.text(475, 350, '$0', {
      fontSize: '46px',
      fontStyle: 'bold',
    });

    Phaser.Actions.GridAlign(this.chips, {
      width: 4, // Aligned vertically
      height: 2,
      cellWidth: 137,
      cellHeight: 137,
      x: -40, // Adjust these to be in the center of the blue area
      y: 400,
    });

    // Deal Button
    this.createDealButton();
    // Attach an event to this button if needed
  }
}

// export { BlackjackScene, HomeScene };
export { BlackjackScene };
