export interface TimeSlot {
  time: string;
  endTime: string;
  available: boolean;
  booking?: any;
}

export interface RoomSchedule {
  room: {
    id: number;
    name: string;
    type: string;
    building: string;
    floor: number;
    capacity: number;
    status: number;
    accessible: boolean;
    facilities: {
      projector: boolean;
      whiteboard: boolean;
      airConditioning: boolean;
      computers: boolean;
      smartBoard: boolean;
      audioSystem: boolean;
    };
  };
  date: string;
  timeSlots: TimeSlot[];
  currentStatus: {
    available: boolean;
    nextBooking?: any;
  };
  bookings: any[];
}