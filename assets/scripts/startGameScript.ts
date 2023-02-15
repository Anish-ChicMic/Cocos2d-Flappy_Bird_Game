import { _decorator, Component, Node, director, Input, input } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('startGameScript')
export class startGameScript extends Component {

    somethingPressed: boolean;

    
    onLoad(){
        director.preloadScene("scene");
        
        input.on(Input.EventType.KEY_DOWN, ()=>{
            director.loadScene("scene");
        }, this);
    }

    
    start() {

    }

    update(deltaTime: number) {
        
    }

    
}


