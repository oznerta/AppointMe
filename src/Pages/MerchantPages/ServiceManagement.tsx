import { useEffect, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase/config';
import { getAuth } from 'firebase/auth';
import { Button } from "@/components/ui/button"; 
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"; 
import { Input } from "@/components/ui/input"; 
import { Label } from "@/components/ui/label"; 

interface Service {
  id: string;
  serviceName: string;
  description: string;
  price: number; 
  startTime: string; // New property
  endTime: string; // New property
  availability: string[]; // New property for available days
}

function ServiceManagement() {
  const [services, setServices] = useState<Service[]>([]);
  const [newService, setNewService] = useState<Omit<Service, 'id'>>({
    serviceName: '',
    description: '',
    price: 0, 
    startTime: '00:00', // Default value
    endTime: '12:00', // Default value
    availability: [], // Default value
  });
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchServices = async () => {
    try {
      const servicesCollection = collection(db, 'services');
      const serviceSnapshot = await getDocs(servicesCollection);
      const serviceList = serviceSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Service[];
      setServices(serviceList);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleAddService = async () => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (newService.serviceName && newService.description && newService.price) {
      // Adjust condition to treat both '24:00' and '00:00' as always open
      const closingTime = (newService.endTime === '24:00' || newService.endTime === '00:00') 
        ? 'Always Open' 
        : newService.endTime;
  
      try {
        const docRef = await addDoc(collection(db, 'services'), {
          serviceName: newService.serviceName,
          description: newService.description,
          price: newService.price, 
          startTime: newService.startTime,
          endTime: closingTime, // Store adjusted closing time
          availability: newService.availability,
          createdAt: new Date(),
          userId: userId,
        });
        setServices([...services, { id: docRef.id, ...newService, endTime: closingTime }]);
        setNewService({ serviceName: '', description: '', price: 0, startTime: '00:00', endTime: '24:00', availability: [] });
        setDialogOpen(false); 
      } catch (error) {
        console.error("Error adding service:", error);
      }
    }
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setNewService({ serviceName: service.serviceName, description: service.description, price: service.price, startTime: service.startTime, endTime: service.endTime, availability: service.availability });
    setDialogOpen(true); 
  };

  const handleUpdateService = async () => {
    if (editingService) {
      // Treat '24:00' as always open
      const closingTime = newService.endTime === '24:00' ? 'Always Open' : newService.endTime;
  
      try {
        const serviceDocRef = doc(db, 'services', editingService.id);
        await updateDoc(serviceDocRef, {
          serviceName: newService.serviceName,
          description: newService.description,
          price: newService.price,
          startTime: newService.startTime,
          endTime: closingTime, // Update adjusted closing time
          availability: newService.availability,
        });
  
        const updatedServices = services.map(service => 
          service.id === editingService.id ? { ...editingService, ...newService, endTime: closingTime } : service
        );
        setServices(updatedServices);
        setEditingService(null);
        setNewService({ serviceName: '', description: '', price: 0, startTime: '00:00', endTime: '24:00', availability: [] }); 
        setDialogOpen(false); 
      } catch (error) {
        console.error("Error updating service:", error);
      }
    }
  };
  const handleDeleteService = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'services', id));
      setServices(services.filter(service => service.id !== id));
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  };

  const displayServiceHours = (service: Service) => {
    // Check if the start and end time are both '00:00', then treat it as always available
    if (service.startTime === '00:00' && service.endTime === '00:00') {
      return 'Available: Always Open'; // Adjust this line as needed for your desired output
    }
  
    // Adjust this line to check for 'Always Open' or any equivalent
    if (service.endTime === 'Always Open' || service.endTime === '24:00') {
      return 'Available: Always Open'; // Consider if 'Always Open' is to be treated differently
    }
  
    return `Available from ${service.startTime} to ${service.endTime}`;
  };
  
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div>
      <h1>Service Management</h1>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => {
            setEditingService(null); 
            setNewService({ serviceName: '', description: '', price: 0, startTime: '00:00', endTime: '12:00', availability: [] }); 
          }}>
            Add New Service
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
            <DialogDescription>
              {editingService ? 'Make changes to your service here.' : 'Fill in the details to add a new service.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="serviceName" className="text-right">Service Name</Label>
              <Input
                id="serviceName"
                value={newService.serviceName}
                onChange={(e) => setNewService({ ...newService, serviceName: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Input
                id="description"
                value={newService.description}
                onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">Price</Label>
              <Input
                type="number"
                id="price"
                value={newService.price}
                onChange={(e) => setNewService({ ...newService, price: parseFloat(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startTime" className="text-right">Start Time</Label>
              <Input
                type="time"
                id="startTime"
                value={newService.startTime}
                onChange={(e) => setNewService({ ...newService, startTime: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endTime" className="text-right">End Time</Label>
              <Input
                type="time"
                id="endTime"
                value={newService.endTime}
                onChange={(e) => setNewService({ ...newService, endTime: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="availability" className="text-right">Availability</Label>
              <div className="col-span-3">
              {daysOfWeek.map((day) => (
  <label key={day} className="mr-2">
    <input
      type="checkbox"
      checked={newService.availability.includes(day)}
      onChange={() => {
        setNewService(prev => ({
          ...prev,
          availability: prev.availability.includes(day)
            ? prev.availability.filter(d => d !== day)
            : [...prev.availability, day]
        }));
      }}
    /> {day.slice(0, 2)}
  </label>
))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={editingService ? handleUpdateService : handleAddService}>
              {editingService ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {services.map((service) => (
    <div key={service.id} className="bg-white shadow-lg rounded-lg p-5 border border-gray-200 transition-transform transform hover:scale-105">
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{service.serviceName}</h3>
      <p className="text-gray-600 mb-4">{service.description}</p>
      <p className="text-lg font-bold text-gray-800 mb-2">Price: ${service.price}</p>
      <p className="text-gray-500">{displayServiceHours(service)}</p>
      <p className="text-gray-500 mb-4">Available on: {service.availability.join(', ')}</p>
      <div className="flex space-x-2">
        <Button onClick={() => handleEditService(service)} className="flex-1 bg-blue-500 text-white hover:bg-blue-600 transition-colors">Edit</Button>
        <Button onClick={() => handleDeleteService(service.id)} className="flex-1 bg-red-500 text-white hover:bg-red-600 transition-colors">Delete</Button>
      </div>
    </div>
  ))}
</div>

    </div>
  );
}

export default ServiceManagement;
