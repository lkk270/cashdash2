import { Elsie_Swash_Caps } from 'next/font/google';
import gameEvents from './event-emitter';
import { initialize } from 'next/dist/server/lib/render-server';
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

const PLACED_CHIP_X = 427.5;
const CARD_INITIAL_X = 375;
const CARD_X_SEPARATION = 50;
const PLAYER_CARD_Y = 600;
const DEALER_CARD_Y = 150;
const CENTER_Y = 375;
const PLACED_CHIP_X_MULTIPLIER = 2.5;

const CHIP_OFFSETS = [0, -5, -10];

// Game Scene
class BlackjackScene extends Phaser.Scene {
  onGameStart: () => void;
  onGameEnd: (score: number) => void;
  private balance: number = 100;
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
  private dealerHand: (string | undefined)[] = [];
  private dealerHandSprites: Phaser.GameObjects.Sprite[] = [];
  private dealerHandValue: number = 0;
  private playerHandsValues: number[] = [0];
  private playerHands: (string | undefined)[][] = [[]];
  private playerHandsSprites: Phaser.GameObjects.Sprite[][] = [[]];
  private activePlayerHandIndex: number = 0;
  private currentDealerHandValueText: Phaser.GameObjects.Text | null = null;
  private currentDealerHandValueCircle: Phaser.GameObjects.Container | null = null;
  private currentPlayerHandValueCircle: Phaser.GameObjects.Container | null = null;
  private currentPlayerHandValueText: Phaser.GameObjects.Text | null = null;

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
    if (balance <= 999) {
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
      this.dealButton?.setVisible(false).disableInteractive();
    } else {
      this.dealButton?.setVisible(true).setInteractive();
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
        this.allInButton?.setVisible(false).disableInteractive();
        this.clearBetButton?.setVisible(true).setInteractive();
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
        this.clearBetButton?.setVisible(false).disableInteractive();
        this.allInButton?.setVisible(true).setInteractive();
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
    this.dealButton?.setVisible(false).disableInteractive();
    this.hitButton?.setVisible(true).setInteractive();
    this.standButton?.setVisible(true).setInteractive();
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
          this.allInButton?.setVisible(false).disableInteractive(); // Hide the text after the animation
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
          this.clearBetButton?.setVisible(false).disableInteractive(); // Hide the text after the animation
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

  createTextInCircle(x: number, y: number, textContent: string) {
    // Create a graphics object
    const graphics = this.add.graphics({ fillStyle: { color: 0x000000, alpha: 0.125 } }); // Black color with 50% opacity

    const circleRadius = 30; // Change this to adjust the size of your circle
    graphics.fillCircle(0, 0, circleRadius);

    // Add the text
    const text = this.add
      .text(0, 0, textContent, {
        color: '#ffffff', // White color for the text
        fontSize: '30px',
      })
      .setOrigin(0.5, 0.5); // This will center the text

    // Group them using a container
    const container = this.add.container(x, y);
    container.add(graphics);
    container.add(text);

    return {
      container: container,
      text: text,
    };
  }

  createHitButton() {
    this.hitButton = this.createButton(250, 375, 'Hit');
    this.hitButton.setVisible(false);
    this.hitButton?.on('pointerdown', () => {
      this.selectedChips[this.selectedChips.length - 1].disableInteractive();
      this.splitButton?.setVisible(false).disableInteractive();
      this.doubleDownButton?.setVisible(false).disableInteractive();
      const newCard = this.cards.pop();
      this.playerHands[this.activePlayerHandIndex].push(newCard);
      const numCards = this.playerHands[this.activePlayerHandIndex].length;
      const numOtherCards = numCards - 1;

      if (numCards % 2 == 1) {
        const animationDuration = 300; // Duration of the animation in milliseconds

        for (let i = 0; i < numOtherCards; i++) {
          const card = this.playerHandsSprites[this.activePlayerHandIndex][i];
          const newPosX = card.x - CARD_X_SEPARATION - 4; // Calculate the new X position

          // Tween to animate the card's movement
          this.tweens.add({
            targets: card,
            x: newPosX,
            duration: animationDuration,
            ease: 'Power2', // Change this if you need another easing function
          });
        }
      }

      setTimeout(() => {
        this.displayCards(
          [newCard],
          this.playerHandsSprites[this.activePlayerHandIndex][numOtherCards - 1].x +
            CARD_X_SEPARATION,
          PLAYER_CARD_Y,
          false
        );
      }, 300);

      this.playerHandsValues[this.activePlayerHandIndex] = this.calculateHandValue(
        this.playerHands[this.activePlayerHandIndex]
      );
      this.currentPlayerHandValueText?.setText(this.playerHandsValues[0].toString());
      const playersHandValue = this.playerHandsValues[this.activePlayerHandIndex];
      if (playersHandValue > 20) {
        if (playersHandValue === 21) {
          //blackjack
        } else {
          //over
        }
        this.time.delayedCall(1250, () => {
          this.handleDealersTurn();
        });
      }
    });
  }

  handleDealersTurn() {
    this.hitButton?.setVisible(false).disableInteractive();
    this.standButton?.setVisible(false).disableInteractive();
    //make back card a real card
    let newCard = this.cards.pop();
    this.dealerHand[0] = newCard;

    this.moveBackCard();
    this.time.delayedCall(500, () => {
      this.displayDealersFirstCard(newCard);
      this.dealerHandValue = this.calculateHandValue(this.dealerHand);
      this.currentDealerHandValueText?.setText(this.dealerHandValue.toString());

      this.time.delayedCall(1250, () => {
        let numCards = 3;
        let numOtherCards = 2;
        newCard = this.cards.pop();
        this.dealerHand.push(newCard);
        if (numCards % 2 == 1) {
          const animationDuration = 300; // Duration of the animation in milliseconds

          for (let i = 0; i < numOtherCards; i++) {
            const card = this.dealerHandSprites[i];
            const newPosX = card.x - CARD_X_SEPARATION - 4; // Calculate the new X position

            // Tween to animate the card's movement
            this.tweens.add({
              targets: card,
              x: newPosX,
              duration: animationDuration,
              ease: 'Power2', // Change this if you need another easing function
            });
          }
        }

        setTimeout(() => {
          this.displayCards(
            [newCard],
            this.dealerHandSprites[numOtherCards - 1].x + CARD_X_SEPARATION,
            DEALER_CARD_Y,
            true,
            numCards
          );
        }, 300);
        this.dealerHandValue = this.calculateHandValue(this.dealerHand);
        this.currentDealerHandValueText?.setText(this.dealerHandValue.toString());
        const dealersHandValue = this.dealerHandValue;
        if (dealersHandValue > 20) {
          if (dealersHandValue === 21) {
            //blackjack
          } else {
            //over
          }
        }
      });
    });
  }

  moveBackCard() {
    const backCard = this.dealerHandSprites[0];
    this.tweens.add({
      targets: backCard,
      x: CARD_INITIAL_X + CARD_X_SEPARATION,
      y: DEALER_CARD_Y,
      duration: 300,
      ease: 'Power2', // Change this if you need another easing function
    });
  }

  displayDealersFirstCard(card: string | undefined) {
    this.dealerHandSprites[1].setDepth(1);
    const sprite = this.add
      .sprite(CARD_INITIAL_X + CARD_X_SEPARATION, DEALER_CARD_Y, 'cards', card)
      .setDepth(0);
    this.dealerHandSprites[0].destroy();
    this.dealerHandSprites[0] = sprite;
    this.tweens.add({
      targets: sprite,
      x: CARD_INITIAL_X,
      y: DEALER_CARD_Y,
      duration: 1000,
      ease: 'Power2', // Change this if you need another easing function
    });
  }

  createStandButton() {
    this.standButton = this.createButton(650, 375, 'Stand');
    this.standButton.setVisible(false).disableInteractive();
    this.standButton?.on('pointerdown', () => {
      this.handleDealersTurn();
    });
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
    this.doubleDownButton?.on('pointerdown', () => {
      this.doubleDownButton?.setVisible(false).disableInteractive();
      this.splitButton?.setVisible(false).disableInteractive();
    });
  }

  createSplitButton() {
    this.splitButton = this.createButton(650, 325, 'Split');
    this.splitButton.setVisible(false);
    this.splitButton?.on('pointerdown', () => {});
  }

  calculateHandValue(frameNames: (string | undefined)[]) {
    let total = 0;
    let numAces = 0;

    for (let frameName of frameNames) {
      if (!frameName) {
        continue;
      }
      frameName = frameName.toLowerCase();
      // Extracting the number or value part from the card name
      const valuePart = frameName.replace(/(clubs|diamonds|hearts|spades)/i, '');

      // Checking for number cards
      if (!isNaN(Number(valuePart))) {
        total += parseInt(valuePart);
      }

      // Checking for face cards
      if (valuePart === 'king' || valuePart === 'queen' || valuePart === 'jack') {
        total += 10;
      }

      // Checking for aces
      if (valuePart === 'ace') {
        numAces += 1;
      }
    }

    // Handling the aces
    for (let i = 0; i < numAces; i++) {
      if (total + 11 <= 21) {
        total += 11;
      } else {
        total += 1;
      }
    }
    return total;
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
    //deals the first cards
    this.playerHands = [[this.cards.pop(), this.cards.pop()]];
    this.dealerHand = ['back', this.cards.pop()];

    // Display first player card
    this.displayCards([this.playerHands[0][0]], CARD_INITIAL_X, PLAYER_CARD_Y, false);

    // Delay for next card
    this.time.delayedCall(300, () => {
      // Display first dealer card
      this.displayCards([this.dealerHand[0]], CARD_INITIAL_X, DEALER_CARD_Y, true);

      // Delay for next card
      this.time.delayedCall(300, () => {
        // Display second player card
        this.displayCards(
          [this.playerHands[0][1]],
          CARD_INITIAL_X + CARD_X_SEPARATION,
          PLAYER_CARD_Y,
          false
        );

        // Delay for last card
        this.time.delayedCall(300, () => {
          // Display second dealer card
          this.displayCards(
            [this.dealerHand[1]],
            CARD_INITIAL_X + CARD_X_SEPARATION,
            DEALER_CARD_Y,
            true
          );

          this.time.delayedCall(300, () => {
            this.playerHandsValues[0] = this.calculateHandValue(this.playerHands[0]);
            this.dealerHandValue = this.calculateHandValue(this.dealerHand);
            const circleTextObjPlayer = this.createTextInCircle(
              600,
              470,
              this.playerHandsValues[0].toString()
            );
            const circleTextObjDealer = this.createTextInCircle(
              600,
              270,
              this.dealerHandValue.toString()
            );
            this.currentPlayerHandValueCircle = circleTextObjPlayer.container;
            this.currentPlayerHandValueText = circleTextObjPlayer.text;
            this.currentDealerHandValueCircle = circleTextObjDealer.container;
            this.currentDealerHandValueText = circleTextObjDealer.text;
          });
        });
      });
    });
  }

  displayCards(
    cards: (string | undefined)[],
    startX: number,
    startY: number,
    dealer = false,
    depth = 1
  ) {
    const animationDuration = 300; // Duration of the animation in milliseconds
    const initialX = 0; // Initial position for the animation
    const initialY = 0; // Initial position for the animation

    for (let i = 0; i < cards.length; i++) {
      const frameName = cards[i];
      let sprite;
      if (dealer) {
        sprite = this.add.sprite(initialX, initialY, 'cards', frameName).setDepth(depth);
        this.dealerHandSprites.push(sprite);
      } else {
        sprite = this.add.sprite(initialX, initialY, 'cards', frameName);
        this.playerHandsSprites[this.activePlayerHandIndex].push(sprite);
      }

      // Tween to move the card to its position
      this.tweens.add({
        targets: sprite,
        x: startX + i * 100,
        y: startY,
        duration: animationDuration,
        ease: 'Power2', // Change this if you need another easing function
        delay: i * 100, // This staggers the animation start time for each card
      });
    }
  }

  cleanUp() {
    this.chipCounts.clear();
    this.selectedChips = [];
    this.lastSelectedChipXPosition = PLACED_CHIP_X;
    this.selectedChipsTotalText = null;
    this.canSelectChip = true;
    this.canDeselectChip = true;
    this.dealInProgress = false;
    this.dealerHand = [];
    this.dealerHandSprites = [];
    this.dealerHandValue = 0;
    this.playerHandsValues = [0];
    this.playerHands = [[]];
    this.playerHandsSprites = [[]];
    this.activePlayerHandIndex = 0;
  }

  create() {
    this.cleanUp();
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

    this.selectedChipsTotalText = this.add.text(485, 367.5, '$0', {
      fontSize: '26px',
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
