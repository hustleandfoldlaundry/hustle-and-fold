import { createContext, useContext, useState } from "react";

const BookingContext = createContext();

const initialBookingData = {
  step1Total: 0,
  step2Total: 0,
};

export function BookingProvider({ children }) {
  const [bookingData, setBookingData] =
    useState(initialBookingData);

  function clearBooking() {
    setBookingData(initialBookingData);
  }

  return (
    <BookingContext.Provider
      value={{
        bookingData,
        setBookingData,
        clearBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  return useContext(BookingContext);
}