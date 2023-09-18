import gameEvents from './event-emitter';

export default class BlackjackScene extends Phaser.Scene {
  constructor(config: Phaser.Types.Scenes.SettingsConfig) {
    super();
  }

  preload() {
    this.load.image('bg', '/blackjack/casinotablebg.png');
    this.load.atlas('cards', '/blackjack/cards.png', '/blackjack/cards.json');
  }

  create() {
    this.add.image(400, 300, 'bg');

    const frames = this.textures.get('cards').getFrameNames();

    const cards = [];

    //  Create 8 cards and push them into an array

    for (var i = 0; i < 8; i++) {
      cards.push(this.add.sprite(0, 0, 'cards', Phaser.Math.RND.pick(frames)));
    }

    //  The cards are 140x190 in size

    //  Let's lay them out in a 4x2 grid, with 10px spacing between them

    Phaser.Actions.GridAlign(cards, {
      width: 4,
      height: 2,
      cellWidth: 150,
      cellHeight: 200,
      x: 100,
      y: 100,
    });
  }
}
