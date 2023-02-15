import {
  _decorator,
  Component,
  Node,
  input,
  Input,
  EventKeyboard,
  KeyCode,
  Prefab,
  tween,
  Vec3,
  easing,
  UITransform,
  Rect,
  NodePool,
  instantiate,
  random,
  randomRange,
  randomRangeInt,
  Vec2,
  size,
  Size,
  Label,
  game,
  rect,
  Graphics, 
  Color,
  director,
  
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("moveBirdScript")
export class moveBirdScript extends Component {
  @property(Node)
  myBird: Node | null = null;

  @property(Node)
  ground_1: Node | null = null;

  @property(Node)
  ground_2: Node | null = null;

  // @property(Node)
  // hurdle_1: Node | null = null;

  @property(Prefab)
  hurdlePrefab: Node | null = null;

  totalScore: number;
  hurdlePool: NodePool = new NodePool();
  deltaTimeGlobal: number;
  speed: number; // speed of ground and hurdles movement
  round: number; // At every round, speed will increase

  onLoad() {
    console.log("On Load!");

    this.totalScore = 0;
    this.speed=100;
    this.round=1;
    for (let cnt = 0; cnt < 5; cnt++) {
      let newHurdle = instantiate(this.hurdlePrefab);
      newHurdle.name = "hurdle";
      this.hurdlePool.put(newHurdle);
    }

    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    input.on(Input.EventType.KEY_UP, this.onKeyUp, this);

    director.preloadScene("endGameScene")
  }

  start() {
    console.log("On Start!");

    // Adding hurdles at every 4 seconds
    this.schedule(() => {
      this.addHurdle();
    }, 4);
  
  }

  update(deltaTime: number) {

    // Free Fall of Bird 
    let curPosOfBird = this.myBird.getPosition();
    curPosOfBird.y -= deltaTime * 100; // speed = 80
    this.myBird.setPosition(curPosOfBird);

    this.deltaTimeGlobal = deltaTime;

    // Moving hurdles
    this.moveGeneratedHurdles(deltaTime, this.speed);

    // Ground Movement
    this.movingGround(this.ground_1, deltaTime, this.speed);
    
    // Collision Detection
    let hurdleListLength = this.node.getChildByName("hurdleList").children.length;
    let canvasChildLen = this.node.children.length;
    console.log("Canvas child leng: " + canvasChildLen);
    console.log("HurdleList Lenght: " + hurdleListLength)

    let birdRectLocal = this.node.getChildByName("birdNode").getComponent(UITransform).getBoundingBox();
    let baseRectLocal = this.node.getChildByName("baseGround-1").getComponent(UITransform).getBoundingBox();
    if(birdRectLocal.intersects(baseRectLocal)){
      console.log("base collided!")
      console.log("birdRect: "+birdRectLocal);
      console.log("baseRect: "+baseRectLocal);
      // game.pause();
      director.loadScene("endGameScene");
    }

    for (let i = 0; i < hurdleListLength; i++) {
      let dymHurdle = this.node.getChildByName("hurdleList").children[i];
      
      if (dymHurdle) {
        let birdRect = this.node.getChildByName("birdNode").getComponent(UITransform).getBoundingBoxToWorld();
        let hurdleUpRect = dymHurdle.getChildByName("pipeUp").getComponent(UITransform).getBoundingBoxToWorld();
        let hurdleDwnRect = dymHurdle.getChildByName("pipeDown").getComponent(UITransform).getBoundingBoxToWorld();
        let scrorerNode = dymHurdle.getChildByName("scrorerNode").getComponent(UITransform).getBoundingBoxToWorld();

        if(this.isBirdCollided(birdRect, hurdleUpRect, hurdleDwnRect)) {
          // game.pause();
          director.loadScene("endGameScene");
        }
        else if(birdRect.intersects(scrorerNode) && dymHurdle.getChildByName("scrorerNode").active) {
          dymHurdle.getChildByName("scrorerNode").active = false;
          //updating score here!
          this.addScore();
          this.node.getChildByName("scoreBoard").children[0].getComponent(Label).string = `Score: ${this.totalScore.toString()}`;
        }
      }
    }

    // Updating score of player
    localStorage.setItem('Score', `${this.totalScore}`)

    // Auto speed increase
    if(this.totalScore===this.round*10 && this.totalScore%10 === 0){
      this.speed += 50;
      this.round+=1;
      this.node.getChildByName("speedNotifier").getComponent(Label).string = "🌟 speed Increased 🌟";
      this.node.getChildByName("levelBoard").children[0].getComponent(Label).string = `Level: ${this.round}`;

      // setTimeout(() => {
      //   this.node.getChildByName("speedNotifier").getComponent(Label).string = "🌟 speed Increased 🌟";
      //   setTimeout(() => {
      //     this.node.getChildByName("speedNotifier").getComponent(Label).string = "";
      //   }, 5);
      // }, 1);


      console.log("******************************************* speed increased");
    }
    else{
      this.node.getChildByName("speedNotifier").getComponent(Label).string = "";
    }

  }


    addScore() {
      this.totalScore += 1;
      console.log(
        "*********************************************************************"
      );
      console.log("Score Count: " + this.totalScore);
      console.log(
        "*********************************************************************"
      );
    }

    addHurdle() {
      if (this.hurdlePool.size()) {
        // let canvasHeight = this.node.getComponent(UITransform).contentSize.height;
        let newNode = this.hurdlePool.get();
        let currPos = newNode.getPosition();

        newNode.setPosition(450, randomRangeInt(-60, 100));
        newNode.getChildByName("scrorerNode").active = true;
        this.node.getChildByName("hurdleList").addChild(newNode);
        console.log("Hurdle Added!");
      }
    }

    // Find collision of bird
    isBirdCollided(bird: Rect, hurdleUp: Rect, hurdleDown: Rect) {
      if (bird.intersects(hurdleUp) || bird.intersects(hurdleDown)) {
        console.log("birdRect h: "+bird);
        console.log("UpRect h: "+hurdleUp);
        console.log("DownRect h: "+hurdleDown);
        return true;
      }
      return false;
    }

    // moving the ground object
    movingGround(ground: Node, deltaTime: number, moveSpeed) {
      let currPosOfGnd_1 = ground.getPosition();
      currPosOfGnd_1.x -= deltaTime * moveSpeed;
      ground.setPosition(currPosOfGnd_1);

      if (currPosOfGnd_1.x + 480 <= 0) {
        currPosOfGnd_1.x = 480.156;
        ground.setPosition(currPosOfGnd_1);
      }
    }

    // Move generated hurdles
    moveGeneratedHurdles(deltaTime: number, moveSpeed) {
      this.node.getChildByName("hurdleList").children.forEach((child) => {
          let pos = child.getPosition();
          let canvasWidth = this.node.getComponent(UITransform).contentSize.width;
          let hurdleWidth = child.getComponent(UITransform).contentSize.width;

          pos.x -= deltaTime * moveSpeed; // Moving hurdles
          child.setPosition(pos);

          if (pos.x <= -1 * (canvasWidth * 0.5 + hurdleWidth * 0.5)) { // If hurdle gone out of frame, put it again in nodepool to reuse it again
            this.hurdlePool.put(child);
          }
      });
    }

    // Keyborad Event
    onKeyDown = () => {
      console.log("Press a key");
      let oldPosOfImg = this.myBird.getPosition();

      tween(this.myBird)
        .to(0.3,{position: new Vec3(oldPosOfImg.x, oldPosOfImg.y + 45, oldPosOfImg.z)}
          // { easing: "bounceOut" }
        )
        .start();

        this.myBird.angle = 30;
    };

    onKeyUp = () => {
      console.log("Release a key");
    };
  }
