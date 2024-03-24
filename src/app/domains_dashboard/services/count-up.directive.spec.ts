import { CountUpDirective } from './count-up.directive';
import { ElementRef, Renderer2 } from '@angular/core';

describe('CountUpDirective', () => {
  it('should create an instance', () => {
    const elementRefMock = {} as ElementRef;
    const rendererMock = {} as Renderer2; // You also need to provide a mock for Renderer2

    const directive = new CountUpDirective(elementRefMock, rendererMock);
    expect(directive).toBeTruthy();
  });
});
