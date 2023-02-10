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
    // Bird Movement
    let curPosOfBird = this.myBird.getPosition();
    curPosOfBird.y -= deltaTime * 80;
    this.myBird.setPosition(curPosOfBird);

    this.deltaTimeGlobal = deltaTime;

    // Moving hurdles
    this.moveGeneratedHurdles();

    // Ground Movement
    this.movingGround(this.ground_1, deltaTime);

    // Collision Detection
    let birdRect = this.node
      .getChildByName("birdNode")
      .getComponent(UITransform)
      .getBoundingBoxToWorld();
    let baseRect = this.node
      .getChildByName("baseGround-1")
      .getComponent(UITransform)
      .getBoundingBoxToWorld();

    if (birdRect.intersects(baseRect)) {
      console.log("Bird Collided With Base!");
    }

    let canvasChildLen = this.node.children.length;
    console.log("Child leng: " + canvasChildLen);
    if (this.node.children[7]) {
      let hurdleUpRect = this.node.children[7]
        .getChildByName("pipeUp")
        .getComponent(UITransform)
        .getBoundingBoxToWorld();

      let hurdleDwnRect = this.node.children[7]
        .getChildByName("pipeDown")
        .getComponent(UITransform)
        .getBoundingBoxToWorld();

      let scrorerNode = this.node.children[7]
        .getChildByName("scrorerNode")
        .getComponent(UITransform)
        .getBoundingBoxToWorld();

      if (birdRect.intersects(hurdleUpRect)) {
        console.log("Bird Collided Up !");
      }
      if (birdRect.intersects(hurdleDwnRect)) {
        console.log("Bird Collided Dwn!");
      }

      if (
        birdRect.intersects(scrorerNode) &&
        this.node.children[7].getChildByName("scrorerNode").active
      ) {
        this.node.children[7].getChildByName("scrorerNode").active = false;
        //update score here!
        this.addScore();
        this.node
          .getChildByName("scoreBoard")
          .children[0].getComponent(
            Label
          ).string = `Score: ${this.totalScore.toString()}`;
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
      this.node.addChild(newNode);
      // this.node.getChildByName("hurdle").setSiblingIndex(2);
      console.log("Hurdle Added!");
    }
  }

  // Find collision of bird
  isBirdCollided(bird: Rect, hurdleUp: Rect, hurdleDown: Rect, ground: Rect) {
    if (
      bird.intersects(hurdleUp) ||
      bird.intersects(hurdleDown) ||
      bird.intersects(ground)
    ) {
      return true;
    }
    return false;
  }

  // Moving the hurdle object
  moveHurdle(hurlde: Node, deltaTime: number) {
    let currPosOfHurdle_1 = hurlde.getPosition();
    currPosOfHurdle_1.x -= deltaTime * 100;
    hurlde.setPosition(currPosOfHurdle_1);

    console.log("Move function called!");
    console.log(currPosOfHurdle_1);

    if (currPosOfHurdle_1.x + 480 <= 0) {
      currPosOfHurdle_1.x = 480.156;
      hurlde.setPosition(currPosOfHurdle_1);
    }
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
  moveGeneratedHurdles() {
    this.node.children.forEach((child) => {
      if (child.name == "hurdle") {
        var pos = child.getPosition();
        // console.log(pos.x);

        pos.x = pos.x - 1;
        let canvasWidth = this.node.getComponent(UITransform).contentSize.width;

        let hurdleWidth = child.getComponent(UITransform).contentSize.width;

        child.setPosition(pos);
        if (pos.x <= -1 * (canvasWidth * 0.5 + hurdleWidth * 0.5)) {
          this.hurdlePool.put(child);
        }
      }
    });
  }

  // Keyborad Event
  onKeyDown = () => {
    console.log("Press a key");
    let oldPosOfImg = this.myBird.getPosition();

    tween(this.myBird)
      .to(
        0.3,
        {
          position: new Vec3(oldPosOfImg.x, oldPosOfImg.y + 45, oldPosOfImg.z),
        }
        // { easing: "bounceOut" }
      )
      .start();

    this.myBird.angle = 30;
  };

  onKeyUp = () => {
    console.log("Release a key");
  };
}
