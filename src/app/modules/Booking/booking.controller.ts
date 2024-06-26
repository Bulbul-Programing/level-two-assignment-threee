import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { bookingService } from './booking.service';
import timeConflict from '../../utils/timeConflict';
import { TDateAdnTime } from './booking.interface';
import AppError from '../../error/AppError';
import { userModel } from '../user/user.model';

const getAllBookingUser = catchAsync(async (req: Request, res: Response) => {
  // checking user exist
  const user = await userModel.findOne({ email: req.user.email });

  if (!user) {
    throw new AppError(404, 'user not found');
  }

  const result = await bookingService.getAllBookingUserIntoDB(req.user.userId);
  res.status(200).json({
    success: true,
    massage: 'Bookings retrieved successfully',
    data: result,
  });
});

const getAllBookingAdmin = catchAsync(async (req: Request, res: Response) => {
  // checking user exist
  const user = await userModel.findOne({ email: req.user.email });

  if (!user) {
    throw new AppError(404, 'user not found');
  }

  const result = await bookingService.getAllBookingAdminIntoDB();

  res.status(200).json({
    success: true,
    massage: 'Bookings retrieved successfully',
    data: result,
  });
});

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;

  const dateAndTime: TDateAdnTime = {
    date: req.body.date,
    startTime: req.body.startTime,
    endTime: req.body.endTime,
  };

  // checking schedule is available in this time
  const existSchedule = await timeConflict(dateAndTime, req.body.facility);
  if (existSchedule) {
    throw new AppError(
      500,
      'This facility is not available at that time ! chose another time or day.',
    );
  }

  const result = await bookingService.createBookingIntoDB(user, req.body);

  res.status(200).json({
    success: true,
    massage: 'Booking create successfully',
    data: result,
  });
});

const cancelBooking = catchAsync(async(req: Request, res : Response)=>{
  // checking uer is exist
  const user = await userModel.findOne({ email: req.user.email });

  if (!user) {
    throw new AppError(404, 'user not found');
  }
  
  const {bookingId} = req.params
  const result = await bookingService.cancelBookingIntoDB(bookingId)

  res.status(200).json({
    success: true,
    massage: 'Booking create successfully',
    data: result,
  });
})

export const bookingController = {
  createBooking,
  getAllBookingAdmin,
  getAllBookingUser,
  cancelBooking
};
