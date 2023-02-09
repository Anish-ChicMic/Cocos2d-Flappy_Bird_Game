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

  hurdlePool: NodePool = new NodePool();
  deltaTimeGlobal: number;

  onLoad() {
    console.log("On Load!");

    for (let cnt = 0; cnt < 5; cnt++) {
      let newHurdle = instantiate(this.hurdlePrefab);
      this.hurdlePool.put(newHurdle);
    }

    let tmpHurdle = this.hurdlePool.get();

    this.node.addChild(tmpHurdle);
    this.moveHurdle(tmpHurdle, this.deltaTimeGlobal);
    

    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
  }

  start() {
    console.log("On Start!");
  }

  update(deltaTime: number) {
    // Bird Movement
    let curPosOfBird = this.myBird.getPosition();
    curPosOfBird.y -= deltaTime * 100;
    this.myBird.setPosition(curPosOfBird);

    this.deltaTimeGlobal = deltaTime;



    // Ground Movement
    this.movingGround(this.ground_1, deltaTime);
    // this.moveHurdle(this.hurdle_1, deltaTime);

    // let BirdRect = this.myBird
    //   .getComponent(UITransform)
    //   .getBoundingBoxToWorld();

    // let hurdleUpRect = this.hurdle_1
    //   .getChildByName("pipeUp")
    //   .getComponent(UITransform)
    //   .getBoundingBoxToWorld();

    // let hurdleDownRect = this.hurdle_1
    //   .getChildByName("pipeDown")
    //   .getComponent(UITransform)
    //   .getBoundingBoxToWorld();

    // let groundRect = this.ground_1
    //   .getComponent(UITransform)
    //   .getBoundingBoxToWorld();

    // if (
    //   this.isBirdCollided(BirdRect, hurdleUpRect, hurdleDownRect, groundRect)
    // ) {
    //   console.log(" ********** Bird Collided! ***********");
    // }
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

  // Keyborad Event
  onKeyDown = () => {
    console.log("Press a key");
    let oldPosOfImg = this.myBird.getPosition();

    tween(this.myBird)
      .to(
        0.3,
        {
          position: new Vec3(oldPosOfImg.x, oldPosOfImg.y + 50, oldPosOfImg.z),
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
