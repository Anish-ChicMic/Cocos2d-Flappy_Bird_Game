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

  onLoad() {
    console.log("On Load!");
    this.totalScore = 0;
    for (let cnt = 0; cnt < 5; cnt++) {
      let newHurdle = instantiate(this.hurdlePrefab);
      newHurdle.name = "hurdle";
      this.hurdlePool.put(newHurdle);
    }

    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
  }

  start() {
    console.log("On Start!");
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
    this.moveGeneratedHurdles(deltaTime);

    // Ground Movement
    this.movingGround(this.ground_1, deltaTime);


    
    // Collision Detection
    let hurdleListLength = this.node.getChildByName("hurdleList").children.length;
    let canvasChildLen = this.node.children.length;
    console.log("Canvas child leng: " + canvasChildLen);
    console.log("HurdleList Lenght: " + hurdleListLength)

    let birdRectLocal = this.node.getChildByName("birdNode").getComponent(UITransform).getBoundingBox();
    let baseRectLocal = this.node.getChildByName("baseGround-1").getComponent(UITransform).getBoundingBox();
    if(birdRectLocal.intersects(baseRectLocal)){
      console.log("base collided!")
      game.pause();
    }

    for (let i = 0; i < hurdleListLength; i++) {
      let dymHurdle = this.node.getChildByName("hurdleList").children[i];
      
      if (dymHurdle) {
        let birdRect = this.node.getChildByName("birdNode").getComponent(UITransform).getBoundingBoxToWorld();
        let hurdleUpRect = dymHurdle.getChildByName("pipeUp").getComponent(UITransform).getBoundingBoxToWorld();
        let hurdleDwnRect = dymHurdle.getChildByName("pipeDown").getComponent(UITransform).getBoundingBoxToWorld();
        let scrorerNode = dymHurdle.getChildByName("scrorerNode").getComponent(UITransform).getBoundingBoxToWorld();

        if(this.isBirdCollided(birdRect, hurdleUpRect, hurdleDwnRect)) {
          game.pause();
        }
        else if(birdRect.intersects(scrorerNode) && dymHurdle.getChildByName("scrorerNode").active) {
          dymHurdle.getChildByName("scrorerNode").active = false;
          //updating score here!
          this.addScore();
          this.node.getChildByName("scoreBoard").children[0].getComponent(Label).string = `Score: ${this.totalScore.toString()}`;
        }
      }
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
        let canvasWidth = this.node.getComponent(UITransform).contentSize.width;
        let newNode = this.hurdlePool.get();
        let currPos = newNode.getPosition();

        newNode.setPosition(450, currPos.y - randomRangeInt(-20, 20) * 5);
        newNode.getChildByName("scrorerNode").active = true;
        this.node.getChildByName("hurdleList").addChild(newNode);
        // this.node.getChildByName("hurdle").setSiblingIndex(2);
        console.log("Hurdle Added!");
      }
    }

    // Find collision of bird
    isBirdCollided(bird: Rect, hurdleUp: Rect, hurdleDown: Rect) {
      if (bird.intersects(hurdleUp) || bird.intersects(hurdleDown)) {
        return true;
      }
      return false;
    }

    // moving the ground object
    movingGround(ground: Node, deltaTime: number) {
      let currPosOfGnd_1 = ground.getPosition();
      currPosOfGnd_1.x -= deltaTime * 100;
      ground.setPosition(currPosOfGnd_1);

      if (currPosOfGnd_1.x + 480 <= 0) {
        currPosOfGnd_1.x = 480.156;
        ground.setPosition(currPosOfGnd_1);
      }
    }

    // Move generated hurdles
    moveGeneratedHurdles(deltaTime: number) {
      this.node.getChildByName("hurdleList").children.forEach((child) => {
          let pos = child.getPosition();
          let canvasWidth = this.node.getComponent(UITransform).contentSize.width;
          let hurdleWidth = child.getComponent(UITransform).contentSize.width;

          pos.x -= deltaTime * 100; // Moving hurdles
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
