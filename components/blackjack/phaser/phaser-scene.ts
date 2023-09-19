import gameEvents from './event-emitter';
const CHIPS = [
  { name: 'c1', value: 1 },
  { name: 'c5', value: 5 },
  { name: 'c25', value: 25 },
  { name: 'c100', value: 100 },
  { name: 'c1000', value: 1000 },
];

const CHIP_OFFSETS = [0, -5, -10];

// Home Screen Scene
class HomeScene extends Phaser.Scene {
  onGameStart: () => void;

  constructor(config: Phaser.Types.Scenes.SettingsConfig, onGameStart: () => void) {
    super({ key: 'HomeScene', ...config });
    this.onGameStart = onGameStart;
  }

  create() {
    this.add
      .text(400, 150, 'Welcome to Blackjack', { fontSize: '32px', align: 'center' })
      .setOrigin(0.5);

    const playButton = this.add.text(400, 300, 'Play', { fontSize: '24px' }).setOrigin(0.5);
    playButton.setInteractive();

    playButton.on('pointerdown', () => {
      this.scene.start('BlackjackScene');
    });
  }
}

// Game Scene
class BlackjackScene extends Phaser.Scene {
  onGameStart: () => void;
  onGameEnd: (score: number) => void;
  private balance: number = 100;
  private balanceText: Phaser.GameObjects.Text | null = null;
  chipCounts: Map<number, number> = new Map();
  private chips: Phaser.GameObjects.Sprite[] = [];
  private selectedChips: Phaser.GameObjects.Sprite[] = [];
  private selectedChipsTotalText: Phaser.GameObjects.Text | null = null;
  private canSelectChip: boolean = true;
  private canDeselectChip: boolean = true;

  constructor(
    config: Phaser.Types.Scenes.SettingsConfig,
    onGameStart: () => void,
    onGameEnd: (score: number) => void
  ) {
    super({ key: 'BlackjackScene', ...config });
    this.onGameStart = onGameStart;
    this.onGameEnd = onGameEnd;
  }

  preload() {
    this.load.image('bg', '/blackjack/casinotablebg.png');
    this.load.atlas('cards', '/blackjack/cards.png', '/blackjack/cards.json');
    this.load.atlas('chips', '/blackjack/chips3.png', '/blackjack/chips3.json');
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

  deselectLastChip() {
    const lastChip = this.selectedChips.pop(); // Get the last chip

    if (lastChip) {
      // Find the corresponding chip value
      const chipValue = CHIPS.find((chipObj) => chipObj.name === lastChip.frame.name)?.value;

      if (chipValue) {
        // Update the balance and chip counts
        this.balance += chipValue;
        const currentCount = this.chipCounts.get(chipValue) || 0;
        this.chipCounts.set(chipValue, currentCount - 1);
      }

      // Update the balance text
      if (this.balanceText) {
        this.balanceText.setText(`Balance: $${this.balance}`);
      }

      // Destroy the chip from the scene
      lastChip.destroy();
      this.updateSelectedChipsTotal();

      // Update the available chips
      this.updateAvailableChips(this.chips); // Make sure `chips` is accessible in this function's scope
    }
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
      this.selectedChipsTotalText.setText(`$${total}`);
    }
  }

  create() {
    this.chipCounts.clear();
    let centerChipCount = 0;
    this.add.image(420, 325, 'bg');

    this.selectedChipsTotalText = this.add.text(250, 300, '$0', {
      fontSize: '30px',
    });

    // Add Balance
    this.balanceText = this.add.text(10, 10, `Balance: $${this.balance}`, { fontSize: '20px' });
    const availableChips = CHIPS.filter((chipObj) => chipObj.value <= this.balance);

    this.chips = CHIPS.map((chipObj) => {
      const chip = this.add.sprite(0, 0, 'chips', chipObj.name).setScale(0.42);
      chip.setInteractive();
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
        this.selectedChips.push(clonedChip);
        this.updateSelectedChipsTotal();

        // Event to handle deselection of the chip
        clonedChip.setInteractive().on('pointerdown', () => {
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
            this.balanceText.setText(`Balance: $${this.balance}`);
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
        const targetX = 400 - offset;
        const targetY = 350;

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
          this.balanceText.setText(`Balance: $${this.balance}`);
        }
        this.updateAvailableChips(this.chips);
      });

      return chip;
    });

    Phaser.Actions.GridAlign(this.chips, {
      width: 5,
      height: 1,
      cellWidth: 100,
      cellHeight: 100,
      x: 100,
      y: 400,
    });

    // Deal Button
    const dealButton = this.add.text(700, 300, 'DEAL', { fontSize: '24px' }).setOrigin(0.5);
    dealButton.setInteractive();
    // Attach an event to this button if needed
  }
}

export { BlackjackScene, HomeScene };
