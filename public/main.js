let currentGame = null;

async function generate() {
  const prompt = document.getElementById('prompt').value.trim();
  const gameDiv = document.getElementById('game');
  gameDiv.innerHTML = 'Loading game...';

  try {
    const res = await fetch('/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    if (!res.ok) {
      throw new Error('Server error');
    }

    const data = await res.json();
    start(data);
  } catch (err) {
    console.error(err);
    gameDiv.innerHTML = '<h2 style="color:red;padding-top:40px">Failed to load game.</h2>';
  }
}

function start(data) {
  document.getElementById('game').innerHTML = '';

  if (currentGame) {
    currentGame.destroy(true);
  }

  const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game',
    backgroundColor: '#111',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: data.mode === 'platformer' ? 500 : 0 },
        debug: false
      }
    },
    scene: {
      preload() {
        this.load.setCORS('anonymous');

        this.load.image('bg', data.background);
        this.load.image('bullet', 'https://labs.phaser.io/assets/sprites/bullet.png');
        this.load.image('ground', 'https://labs.phaser.io/assets/sprites/platform.png');

        this.load.on('loaderror', (file) => {
          console.log('Asset failed:', file.key);
        });
      },

      create() {
        this.add.image(400, 300, 'bg').setDisplaySize(800, 600);

        let score = 0;
        let health = 3;

        // Create player using graphics instead of remote sprite
        const playerGraphic = this.add.rectangle(0, 0, 40, 40, 0x00ffcc);
        this.physics.add.existing(playerGraphic);
        this.player = playerGraphic;
        this.player.body.setCollideWorldBounds(true);
        this.player.setPosition(400, 450);

        if (data.mode === 'platformer') {
          this.ground = this.physics.add.staticGroup();
          this.ground.create(400, 580, 'ground').setScale(2).refreshBody();
          this.physics.add.collider(this.player, this.ground);
        }

        this.enemies = this.physics.add.group();

        this.spawnEnemy = () => {
          let x;
          do {
            x = Phaser.Math.Between(50, 750);
          } while (Math.abs(x - this.player.x) < 150);

          const enemy = this.add.circle(x, data.mode === 'platformer' ? 500 : 80, 20, data.enemy === 'alien' ? 0x66ff66 : 0xff4444);
          this.physics.add.existing(enemy);
          this.enemies.add(enemy);
          enemy.body.setCollideWorldBounds(true);

          if (data.mode === 'platformer') {
            enemy.body.setVelocityX(Math.random() < 0.5 ? -80 : 80);
            enemy.body.setAllowGravity(false);
            this.physics.add.collider(enemy, this.ground);
          }
        };

        for (let i = 0; i < 6 * data.difficulty; i++) {
          this.spawnEnemy();
        }

        this.cursors = this.input.keyboard.createCursorKeys();
        this.bullets = this.physics.add.group();

        this.input.keyboard.on('keydown-SPACE', () => {
          if (data.mode !== 'shooter') return;

          const bullet = this.bullets.create(this.player.x, this.player.y, 'bullet');

          let vx = 0;
          let vy = -300;

          if (this.cursors.left.isDown) vx = -300;
          if (this.cursors.right.isDown) vx = 300;
          if (this.cursors.up.isDown) vy = -300;
          if (this.cursors.down.isDown) vy = 300;

          bullet.setVelocity(vx, vy);
        });

        this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
          if (data.mode === 'platformer' && player.body.velocity.y > 0 && player.y < enemy.y) {
            enemy.destroy();
            player.body.setVelocityY(-250);
            score += 15;
          } else {
            enemy.destroy();
            health--;
          }

          if (health <= 0) {
            this.add.text(250, 250, 'GAME OVER', {
              fontSize: '40px',
              color: '#ff0000'
            });
            this.scene.pause();
          }

          if (this.enemies.countActive(true) === 0) {
            this.add.text(250, 250, 'YOU WIN!', {
              fontSize: '40px',
              color: '#00ff00'
            });
            this.scene.pause();
          }
        });

        this.physics.add.overlap(this.bullets, this.enemies, (bullet, enemy) => {
          bullet.destroy();
          enemy.destroy();
          score += 10;

          if (this.enemies.countActive(true) === 0) {
            this.add.text(250, 250, 'YOU WIN!', {
              fontSize: '40px',
              color: '#00ff00'
            });
            this.scene.pause();
          }
        });

        this.scoreRef = () => score;
        this.healthRef = () => health;
      },

      update() {
        document.getElementById('ui').innerHTML = `Score: ${this.scoreRef()} | Health: ${this.healthRef()}`;

        if (this.cursors.left.isDown) {
          this.player.body.setVelocityX(-180);
        } else if (this.cursors.right.isDown) {
          this.player.body.setVelocityX(180);
        } else {
          this.player.body.setVelocityX(0);
        }

        if (data.mode === 'platformer') {
          if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.body.setVelocityY(-350);
          }
        } else {
          if (this.cursors.up.isDown) this.player.body.setVelocityY(-180);
          else if (this.cursors.down.isDown) this.player.body.setVelocityY(180);
          else this.player.body.setVelocityY(0);
        }

        this.enemies.children.iterate((enemy) => {
          if (!enemy || !enemy.body) return;

          if (data.mode === 'platformer') {
            enemy.body.setVelocityX(enemy.x < this.player.x ? 80 : -80);
          } else {
            this.physics.moveToObject(enemy, this.player, 60 + data.difficulty * 20);
          }
        });
      }
    }
  };

  currentGame = new Phaser.Game(config);
}
