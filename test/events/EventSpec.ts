///<reference path="../../_all.d.ts"/>

module Minute {
    describe("Event extender", () => {
        let obj1:any, obj2:any, emitter1:EmitterEx, emitter2:EmitterEx;

        beforeEach(()=> {
            obj1 = {name: 'obj1'};
            obj2 = {name: 'obj2'};
            emitter1 = new EmitterEx(obj1);
            emitter2 = new EmitterEx(obj2);
        });

        it("should call function when event is fired", () => {
            let mock = jasmine.createSpy('mock method');
            emitter1.once('foo', mock);
            emitter1.once('bar', mock);

            emitter1.dispatch('foo', {bar: 'baz'}, {san: 'man'});
            emitter1.dispatch('bar', {bar: 'baz'}, {san: 'man'});

            expect(mock).toHaveBeenCalledTimes(1);
            let arg = mock.calls.mostRecent().args[0];
            expect(arg instanceof EmitEvent).toBeTruthy();
            expect(arg.eventName).toBe('foo');
            expect(arg.parent).toBe(obj1);
            expect(arg.args).toEqual([{bar: 'baz'}, {san: 'man'}]);
        });

        it("should only call object which is regd", () => {
            let mock1 = jasmine.createSpy('mock method 1');
            let mock2 = jasmine.createSpy('mock method 2');

            emitter1.once('foo', mock1);
            emitter2.once('foo', mock2);
            emitter2.once('bar', mock2);

            emitter2.dispatch('foo', {bar: 'baz'}, {san: 'man'});
            emitter2.dispatch('foo', {bar: 'baz'}, {san: 'man'});
            emitter2.dispatch('bar', {bar: 'baz'}, {san: 'man'});

            expect(mock1).not.toHaveBeenCalled();
            expect(mock2).toHaveBeenCalledTimes(1);
        });
    });
}

