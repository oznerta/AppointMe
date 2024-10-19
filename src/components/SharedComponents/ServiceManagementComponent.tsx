import { useEffect, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc, writeBatch } from 'firebase/firestore';
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CiSquarePlus } from 'react-icons/ci';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableItem from './SortableItem';

interface Service {
    id: string;
    serviceName: string;
    description: string;
    price: number;
    startTime: string;
    endTime: string;
    availability: string[];
    order: number; // New property for ordering
}

interface ServiceWithDragListeners extends Service {
    dragListeners?: any; // Add this temporary property for drag listeners
}

const ServiceManagementComponent = () => {
    const [services, setServices] = useState<ServiceWithDragListeners[]>([]);
    const [newService, setNewService] = useState<Omit<Service, 'id' | 'order'>>({
        serviceName: '',
        description: '',
        price: 0,
        startTime: '00:00',
        endTime: '24:00',
        availability: [],
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
            // Sort services by order
            serviceList.sort((a, b) => a.order - b.order);
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
            const closingTime = (newService.endTime === '24:00' || newService.endTime === '00:00') ? 'Always Open' : newService.endTime;

            try {
                const order = services.length ? services[services.length - 1].order + 1 : 1; // Set order for new service
                const docRef = await addDoc(collection(db, 'services'), {
                    serviceName: newService.serviceName,
                    description: newService.description,
                    price: newService.price,
                    startTime: newService.startTime,
                    endTime: closingTime,
                    availability: newService.availability,
                    createdAt: new Date(),
                    userId: userId,
                    order: order, // Store order in Firestore
                });
                setServices([...services, { id: docRef.id, ...newService, endTime: closingTime, order }]);
                setNewService({ serviceName: '', description: '', price: 0, startTime: '00:00', endTime: '24:00', availability: [] });
                setDialogOpen(false);
            } catch (error) {
                console.error("Error adding service:", error);
            }
        }
    };

    const handleUpdateService = async () => {
        if (editingService) {
            const closingTime = newService.endTime === '24:00' ? 'Always Open' : newService.endTime;

            try {
                const serviceDocRef = doc(db, 'services', editingService.id);
                await updateDoc(serviceDocRef, {
                    serviceName: newService.serviceName,
                    description: newService.description,
                    price: newService.price,
                    startTime: newService.startTime,
                    endTime: closingTime,
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

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = services.findIndex(service => service.id === active.id);
            const newIndex = services.findIndex(service => service.id === over?.id);

            const updatedServices = Array.from(services);
            const [removed] = updatedServices.splice(oldIndex, 1);
            updatedServices.splice(newIndex, 0, removed);

            // Update the order of services
            const updatedOrders = updatedServices.map((service, index) => ({ ...service, order: index + 1 }));
            setServices(updatedOrders);

            // Update the order in the database
            const batch = writeBatch(db);
            updatedOrders.forEach((service, index) => {
                const serviceDocRef = doc(db, 'services', service.id);
                batch.update(serviceDocRef, { order: index + 1 });
            });
            await batch.commit();
        }
    };

    const handleEditService = (service: Service) => {
        setEditingService(service);
        setNewService({
            serviceName: service.serviceName,
            description: service.description,
            price: service.price,
            startTime: service.startTime,
            endTime: service.endTime,
            availability: service.availability,
        });
        setDialogOpen(true);
    };


    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return (
        <div>
            <div className="flex justify-between">
                <h1 className="font-semibold text-xl mb-6">Services</h1>
                <div>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger onClick={() => {
                                setEditingService(null);
                                setNewService({ serviceName: '', description: '', price: 0, startTime: '00:00', endTime: '24:00', availability: [] });
                                setDialogOpen(true);
                            }}>
                                <CiSquarePlus className='size-[35px] text-text-500 cursor-pointer hover:scale-95 hover:text-text-300' />
                            </TooltipTrigger>
                            <TooltipContent className="rounded-[8px] bg-primary-500 text-text-50">
                                <p className="text-[10px]">Add Services</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                        <Button onClick={editingService ? handleUpdateService : handleAddService}>
                            {editingService ? 'Update' : 'Add'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <DndContext onDragEnd={handleDragEnd}>
        <SortableContext items={services.map(service => service.id)} strategy={verticalListSortingStrategy}>
          <div className='service-container cursor-default'>
          {services.map((service) => (
  <SortableItem key={service.id} id={service.id}>
    <div className="flex items-center mb-2 bg-gray-100 px-4 py-6 rounded-xl shadow-md">
      <div className='mr-4'>
        {/* No need to repeat the grabber here, it's already handled */}
      </div>

      <div className='flex-grow'>
        <div className='max-w-[900px] border-r-2'>
          <h2 className="font-semibold">{service.serviceName}</h2>
          <p>{service.description}</p>
          <p>{`Price: $${service.price}`}</p>
          <p>{`Available from ${service.startTime} to ${service.endTime}`}</p>
          <p>{`Available on: ${service.availability.join(', ')}`}</p>
        </div>
      </div>

      <div className="flex space-x-2">
        <Button onClick={() => handleEditService(service)}>Edit</Button>
        <Button variant="outline" onClick={() => handleDeleteService(service.id)}>Delete</Button>
      </div>
    </div>
  </SortableItem>
))}


          </div>
        </SortableContext>
      </DndContext>
        </div>
    );
};

export default ServiceManagementComponent;
