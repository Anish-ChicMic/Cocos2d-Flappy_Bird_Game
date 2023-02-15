import { _decorator, Component, Node, director, game, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('endGameScript')
export class endGameScript extends Component {

    onLoad(){
        director.preloadScene("scene");
    }
    start() {
        let totalScore = localStorage.getItem('Score');
        console.log("Your Score: " + totalScore);
        this.node.getChildByName("Label").getComponent(Label).string = `Your Score ${totalScore.toString()}`;

    }

    update(deltaTime: number) {
        
    }

    restartGame(){
        director.loadScene("scene");
    }

    exitGame(){
        game.end();
    }
}


