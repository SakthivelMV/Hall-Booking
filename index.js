import express from "express";
import uniqid from "uniqid";
const app = express();
const PORT = 5000;
app.use(express.json())


let room = [];
let room_No = 55;
let bookings =[];
let date_regex = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/;
let time_regex = /^(0[0-9]|1\d|2[0-3])\:(00)/;

app.get("/", (req,res) => {
    res.send("Hall booking api")
});


//CREATE ROOM
app.post("/createRoom",(req, res) => {
    let room = {};
    room.id = uniqid();
    room.room_No = room_No;
    room.bookings = [];
    if(req.body.noSeats){
        room.noSeats = req.body.noSeats
    } 
    else
    {
        res.status(400).send({ output: 'Improper seat number'})
};
    if(req.body.amenities)
    {room.amenities = req.body.amenities} 
    else{
        res.send({ output: 'Error, Enter all Amenities in Array format'})
    };
    if(req.body.price){
        room.price = req.body.price
    } else{
        res.send({ output: 'Error in price'})};
    room.push(room);
    room_No++;
    res.send({ output: 'Room Created Successfully'}) 
});

// Booking a room

app.post("/Roombooking",(req, res) => {
    let booking = {};
    booking.id = uniqid();
    if(req.body.customerName){booking.customerName = req.body.customerName} else{res.status(400).send({ output: 'customer Name?'})};
    if(req.body.date){
        if (date_regex.test(req.body.date)) {
            booking.date = req.body.date
        } else{
            res.status(400).send({ output: 'Date in MM/DD/YYYY'})
        }
    } else{
        res.status(400).send({ output: 'Date for booking?'})
    }

    if(req.body.startTime){
        if (time_regex.test(req.body.startTime)) {
            booking.startTime = req.body.startTime
        } else{
            res.status(400).send({ output: 'specify  start time in hh:min(24-hr format) where minutes should be 00 only'})
        }
    } else{
        res.status(400).send({ output: 'specify Starting time for booking.'})
    }

    if(req.body.endTime){
        if (time_regex.test(req.body.endTime)) {
            booking.endTime = req.body.endTime
        } else{
            res.status(400).send({ output: 'specify time in hh:min(24-hr format) where minutes should be 00 only'})
        }
    } else{
        res.status(400).send({ output: 'specify Ending time for booking.'})
    }

    const availableroom = room.filter(room => {
        if(room.bookings.length == 0){
            return true;
        } else{
            room.bookings.filter(book =>{
                if((book.date == req.body.date) ){
                    if((parseInt((book.startTime).substring(0, 1)) > parseInt((req.body.startTime).substring(0, 1)) ) && 
                    (parseInt((book.startTime).substring(0, 1)) > parseInt((req.body.endTime).substring(0, 1)) ) ){ 
                        if((parseInt((book.startTime).substring(0, 1)) < parseInt((req.body.startTime).substring(0, 1)) ) && 
                          (parseInt((book.startTime).substring(0, 1)) < parseInt((req.body.endTime).substring(0, 1)) ) ){ 
                            return true;
                        }
                    }
                }
                else{
                    return true;
                }
            })

        }
    });
    if(availableroom.length == 0){res.status(400).send({ output: 'No Available room on Selected Date and Time'})}
   else{
    roomRec = availableroom[0];
   let count =0;
   room.forEach(element => {
       if(element.roomNo == roomRec.roomNo){
        room[count].bookings.push({
            customerName: req.body.customerName,
            startTime: req.body.startTime,
            endTime: req.body.endTime,
            date: req.body.date
        })
       }
       count++;
   });
   let bookingRec = req.body;
   bookingRec.roomNo = roomRec.roomNo;
   bookingRec.cost = parseInt(roomRec.price) * (parseInt((bookingRec.endTime).substring(0, 1)) - parseInt((bookingRec.startTime).substring(0, 1)));


   bookings.push(bookingRec);
   res.status(200).send({ output: 'Room Booking Successfully'}) 
}
});

app.listen(PORT,()=> 
console.log("Server started on PORT",PORT)
);