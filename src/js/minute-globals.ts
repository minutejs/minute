///<reference path="../../_all.d.ts"/>

module Minute {
    export interface Metadata {
        offset?:number;
        total?:number;
        limit?:number;
        order?:string;
        search?:Search;
        url?:string;
    }

    export interface Search {
        columns:string;
        operator:string;
        value:string;
    }

    export interface Config {
        debug:boolean;
        autoInject:boolean;
        urls:any;
    }

    export interface UiService {
        confirm(text:string):Promise<Object>;
        alert(title:string, text):Promise<Object>;
        prompt(title:string, prompt:string, placeholder:string):Promise<Object>;
        toast(text:string, type:string, hideAfter?:number):Promise<Object>;
        popup(template:string, modal?:boolean, scope?:any, params?:any):Promise<Object>;
        popupUrl(url:string, modal?:boolean, scope?:any, params?:any):Promise<Object>;
        closePopup();
        init();
    }

    export interface RootScopeEx extends ng.IRootScopeService {
        session:Session;
    }

    export interface Session {
        site:any;
        user:any;
        request: any,
        providers:any;
        login(modal?);
        signup(modal?);
    }

    export interface MinuteWindow extends ng.IWindowService {
        Minute: {sessionData: Session};
    }
}
