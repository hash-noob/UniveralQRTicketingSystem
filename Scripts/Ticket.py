from pyqrcode import QRCode 
from pymongo import MongoClient
import fitz 
from dotenv import load_dotenv
import os
import datetime

load_dotenv()
client = MongoClient(os.getenv("MONGODB_URI"))  # Connect to MongoDB server

# Select the database
db = client["Cypher"]

# Select the collection (similar to a table)
collection = db["Passes"]


def add_qr_to_pdf(pdf_path, qr_image_path, output_pdf, page_number=0, x=100, y=100):
    # Open the existing PDF
    doc = fitz.open(pdf_path)

    # Select the page
    page = doc[page_number]  # 0-based index

    # Get the QR image dimensions (resize if needed)
    img_rect = fitz.Rect(x, y, x + 50, y + 60)  # Adjust size and position

    # Insert QR image into PDF
    page.insert_image(img_rect, filename=qr_image_path)

    # Save the modified PDF
    doc.save(output_pdf)
    doc.close()
    print(f"QR code added successfully! Saved as {output_pdf}")


no_of_tickets = 10
for i in range(no_of_tickets):
    document = {
        "Type": "Solo",  # Ticket type (Solo, Group, etc.)
        "creditsCharged": 0,  # Credits used for this ticket
        "issuedAt": datetime.datetime.utcnow(),  # Timestamp of issue
        "eventName": "Cypher Fest 2025",  # Event name
        "holderName": f"Attendee {i+1}",  # Placeholder for attendee name
        "email": f"attendee{i+1}@example.com",  # Placeholder for attendee email
        "phone": f"+91-90000000{i+1:02d}",  # Placeholder for phone number
        "seatNumber": f"A-{i+1:03d}",  # Placeholder for seat assignment
        "status": "active",  # Ticket status (active, used, cancelled)
        "isSold": False  
    }
    result = collection.insert_one(document)
    print(f"Document inserted with ID: {result.inserted_id}")
    s = f"https://cypherscanner.vercel.app/pass/{result.inserted_id}" #replace this string with your own API
    url = pyqrcode.create(s)
    qrName = f"{result.inserted_id}.png"
    url.png(qrName, scale=6)
    add_qr_to_pdf("pass.pdf", qrName, f"{result.inserted_id}.pdf", page_number=0, x=540, y=80)
   