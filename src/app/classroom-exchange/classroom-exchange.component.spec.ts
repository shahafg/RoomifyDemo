import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassroomExchangeComponent } from './classroom-exchange.component';

describe('ClassroomExchangeComponent', () => {
  let component: ClassroomExchangeComponent;
  let fixture: ComponentFixture<ClassroomExchangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassroomExchangeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClassroomExchangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
