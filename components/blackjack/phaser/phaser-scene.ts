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

const CHIP_OFFSETS = [0, -5, -10];

// Game Scene
class BlackjackScene extends Phaser.Scene {
  onGameStart: () => void;
  onGameEnd: (score: number) => void;
  private balance: number = 99999;
  private balanceText: Phaser.GameObjects.Text | null = null;
  chipCounts: Map<number, number> = new Map();
  private chips: Phaser.GameObjects.Sprite[] = [];
  private selectedChips: Phaser.GameObjects.Sprite[] = [];
  private selectedChipsTotalText: Phaser.GameObjects.Text | null = null;
  private canSelectChip: boolean = true;
  private canDeselectChip: boolean = true;
  mainContainer: Phaser.GameObjects.Container | null = null;
  private mainBackground: Phaser.GameObjects.Graphics | null = null;
  private allInButton: Phaser.GameObjects.Graphics | null = null;
  private allInButtonText: Phaser.GameObjects.Text | null = null;
  private dealButton: Phaser.GameObjects.Graphics | null = null;
  private dealButtonText: Phaser.GameObjects.Text | null = null;

  constructor(
    config: Phaser.Types.Scenes.SettingsConfig,
    onGameStart: () => void,
    onGameEnd: (score: number) => void
  ) {
    super({ key: 'BlackjackScene', ...config });
    this.onGameStart = onGameStart;
    this.onGameEnd = onGameEnd;
    this.allInButtonText = null;
    this.dealButtonText = null;
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
    if (!this.canDeselectChip) return;
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
      this.dealButtonText?.setVisible(false);
    } else {
      this.dealButton?.setVisible(true);
      this.dealButtonText?.setVisible(true);
    }
  }

  allInButtonLogic(buttonText: Phaser.GameObjects.Text) {
    if (buttonText.text === 'ALL IN') {
      buttonText.setText('CLEAR BET');

      // Bet all in
      this.betAllIn();
    } else {
      buttonText.setText('ALL IN');

      // Clear the bet
      this.clearAllBets();
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
          this.deselectChip(clonedChip);
        });
      tempChips.push({ chipObj, clonedChip });
    }

    // Animate them to the center individually
    tempChips.forEach((item, idx) => {
      const chipObj = item.chipObj;
      const clonedChip = item.clonedChip;
      clonedChip.x = 350;
      clonedChip.y = 375 + idx * 2.5; // Stacking chips
      (clonedChip as any).originalX = chipObj.originalX;
      (clonedChip as any).originalY = chipObj.originalY;

      this.selectedChips.push(clonedChip);
      this.tweens.add({
        targets: clonedChip,
        x: 350,
        y: 375, // Adjust this to make them stack nicely in the center
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
      this.allInButton = this.add
        .graphics()
        .fillStyle(0x225577, 1) // Button color
        .fillRect(30, 390, 175, 40) // Adjust dimensions as needed
        .setInteractive(
          new Phaser.Geom.Rectangle(30, 390, 175, 40),
          Phaser.Geom.Rectangle.Contains
        );

      const allInButtonText = this.add
        .text(117.5, 410, 'ALL IN', {
          fontSize: '24px',
          padding: { left: 45, right: 45, top: 10, bottom: 10 },
        })
        .setOrigin(0.5, 0.5);

      this.allInButtonText = allInButtonText; // Set the class property here

      this.allInButton.on('pointerover', () => {
        if (this.allInButton) {
          this.allInButton.clear().fillStyle(0x336699, 1).fillRect(30, 390, 175, 40); // Change color on hover
          this.game.canvas.style.cursor = 'pointer'; // <-- Add this line to change the cursor
        }
      });

      this.allInButton.on('pointerout', () => {
        if (this.allInButton) {
          this.allInButton.clear().fillStyle(0x225577, 1).fillRect(30, 390, 175, 40); // Reset color
          this.game.canvas.style.cursor = 'default'; // <-- Add this line to change the cursor
        }
      });

      this.allInButton.on('pointerdown', () => {
        this.allInButtonLogic(allInButtonText);
      });
    }
  }

  createDealButton() {
    const x = 625;
    const y = 300;
    const width = 175;
    const height = 80;
    // Creating the dealButton background
    this.dealButton = this.add
      .graphics()
      .fillStyle(0x007700, 1) // Button color
      .fillRoundedRect(x, y, width, height, 10) // Adjust dimensions as needed
      .setInteractive(
        new Phaser.Geom.Rectangle(x, y, width, height),
        Phaser.Geom.Rectangle.Contains
      )
      .setVisible(false);
    // Add interactive text over the dealButton
    const dealButtonText = this.add
      .text(x + width / 2, y + height / 2, 'DEAL', {
        fontSize: '30px',
        padding: { left: 60, right: 60, top: 10, bottom: 10 },
      })
      .setOrigin(0.5, 0.5)
      .setVisible(false);

    this.dealButtonText = dealButtonText; // Set the class property here

    this.dealButton.on('pointerover', () => {
      if (this.dealButton) {
        this.dealButton.clear().fillStyle(0x009900, 1).fillRoundedRect(x, y, width, height); // Change color on hover
        this.game.canvas.style.cursor = 'pointer'; // <-- Add this line to change the cursor
      }
    });

    this.dealButton.on('pointerout', () => {
      if (this.dealButton) {
        this.dealButton.clear().fillStyle(0x225577, 1).fillRoundedRect(x, y, width, height); // Reset color
        this.game.canvas.style.cursor = 'default'; // <-- Add this line to change the cursor
      }
    });

    this.dealButton.on('pointerdown', () => {
      this.onDealButtonClicked();
    });
  }

  onDealButtonClicked() {
    this.dealButton?.setVisible(false);
    this.dealButtonText?.setVisible(false);
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
          this.allInButtonText?.setVisible(true);
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
    if (this.allInButtonText) {
      this.tweens.add({
        targets: this.allInButtonText,
        y: this.game.canvas.height + this.allInButtonText.height, // moving it completely below the screen
        duration: 500,
        ease: 'Sine.easeInOut',
        onComplete: () => {
          this.allInButtonText?.setVisible(false); // Hide the text after the animation
        },
      });
    }
  }

  createChips() {
    let centerChipCount = 0;
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

            if (!this.canDeselectChip) return; // If we can't deselect, exit early

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

        const offset =
          CHIP_OFFSETS[centerChipCount] !== undefined ? CHIP_OFFSETS[centerChipCount] : -12;
        const targetX = 350 - offset;
        const targetY = 375;

        this.tweens.add({
          targets: clonedChip,
          x: targetX,
          y: targetY,
          duration: 300, // Duration in milliseconds
          ease: 'Sine.easeOut', // The easing function to use (this one is smooth)
          onComplete: () => {
            if (centerChipCount < 3) {
              centerChipCount++;
            }
          },
        });

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

  create() {
    this.chipCounts.clear();

    this.add.image(420, 375, 'bg');
    this.mainContainer = this.add.container();

    this.mainBackground = this.createRoundedBackground(this);
    this.mainContainer.add(this.mainBackground);
    // ALL IN Button
    this.createAllInButton();
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

    this.selectedChipsTotalText = this.add.text(425, 350, '$0', {
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
