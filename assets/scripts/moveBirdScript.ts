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
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("moveBirdScript")
export class moveBirdScript extends Component {
  @property(Node)
  myBird: Node | null = null;

  onLoad() {
    console.log("On Load!");
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    // addEventListener(input.EventType.KEY_DOWN, this.onKeyUp, this);
    input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    // let a = this.node.on(Input.EventType.KEY_PRESSING)
  }
  start() {
    console.log("On Start!");
  }

  update(deltaTime: number) {
    let curPosOfBird = this.myBird.getPosition();
    curPosOfBird.y -=deltaTime*50;
    this.myBird.setPosition(curPosOfBird);
    // this.myBird.angle = -30;
  }

  onKeyDown = () => {
    console.log("Press a key");
    let oldPosOfImg = this.myBird.getPosition();
    // oldPosOfImg.y += 50;
    // this.myBird.setPosition(pos);

    tween(this.myBird)
      .to(
        0.3,
        {
          position: new Vec3(oldPosOfImg.x, oldPosOfImg.y + 50, oldPosOfImg.z),
        },
        { easing: "bounceOut" }
      )
      .start();
    
    this.myBird.angle = 30;
  };

  onKeyUp = () => {
    console.log("Release a key");
  };
}
