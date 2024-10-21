import { useEffect, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../../../lib/firebase/config';
import { getAuth } from 'firebase/auth';
import { DragEndEvent } from '@dnd-kit/core';
import { CiSquarePlus } from 'react-icons/ci';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ServiceForm from './ServiceForm';
import ServiceList from './ServiceList';

interface TimeSlot {
    start: string; // e.g., "09:00"
    end: string;   // e.g., "10:00"
}

interface Service {
    id: string;
    userId: string; // Include userId here
    serviceName: string;
    description: string;
    price: number;
    timeSlots: TimeSlot[];
    availability: string[];
    order: number;
    bookingsCount: number;
    clicksCount: number;
}

interface ServiceWithDragListeners extends Service {
    dragListeners?: any;
}

const ServiceManagementComponent = () => {
    const [showMore, setShowMore] = useState<{ [key: string]: boolean }>({});
    const [services, setServices] = useState<ServiceWithDragListeners[]>([]);
    const [newService, setNewService] = useState<Omit<Service, 'id' | 'order' | 'bookingsCount' | 'clicksCount'>>({
        userId: '',  // Set a default value for userId
        serviceName: '',
        description: '',
        price: 0,
        timeSlots: [],
        availability: [],
    });

    const [editingService, setEditingService] = useState<ServiceWithDragListeners | null>(null);
    const [showForm, setShowForm] = useState(false); // State to toggle form visibility

    const fetchServices = async () => {
        const auth = getAuth();
        const userId = auth.currentUser?.uid;

        if (!userId) return; // Exit if there's no logged-in user

        try {
            const servicesCollection = collection(db, 'services');
            const serviceSnapshot = await getDocs(servicesCollection);
            const serviceList = serviceSnapshot.docs.map(doc => ({
                id: doc.id, // Keep this consistent
                ...doc.data(),
            })) as Service[];

            // Filter services by userId
            const userServices = serviceList.filter(service => service.userId === userId);
            userServices.sort((a, b) => a.order - b.order);
            setServices(userServices);
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
            try {
                const order = services.length ? services[services.length - 1].order + 1 : 1;
                const docRef = await addDoc(collection(db, 'services'), {
                    ...newService,
                    order,
                    bookingsCount: 0,
                    clicksCount: 0,
                    createdAt: new Date(),
                    userId: userId || '', // Ensure userId is included
                });

                // Add the new service to the state with the auto-generated id
                setServices([...services, { id: docRef.id, ...newService, order, bookingsCount: 0, clicksCount: 0, userId: userId || '' }]);
                setNewService({ userId: '', serviceName: '', description: '', price: 0, timeSlots: [], availability: [] });
                setShowForm(false); // Hide form after adding
            } catch (error) {
                console.error("Error adding service:", error);
            }
        }
    };


    const handleUpdateService = async () => {
        if (editingService) {
            try {
                const serviceDocRef = doc(db, 'services', editingService.id);
                await updateDoc(serviceDocRef, {
                    ...newService,
                    userId: editingService.userId, // Keep userId
                });

                const updatedServices = services.map(service =>
                    service.id === editingService.id
                        ? { ...editingService, ...newService }
                        : service
                );
                setServices(updatedServices);
                setEditingService(null);
                setNewService({ userId: '', serviceName: '', description: '', price: 0, timeSlots: [], availability: [] });
                setShowForm(false); // Hide form after updating
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

            const updatedOrders = updatedServices.map((service, index) => ({ ...service, order: index + 1 }));
            setServices(updatedOrders);

            const batch = writeBatch(db);
            updatedOrders.forEach((service, index) => {
                const serviceDocRef = doc(db, 'services', service.id);
                batch.update(serviceDocRef, { order: index + 1 });
            });
            await batch.commit();
        }
    };

    const handleEditService = (service: ServiceWithDragListeners) => {
        // Check if service has userId
        console.log(service.userId); // Should not be undefined or missing
        setEditingService(service);
        setNewService({
            userId: service.userId, // Include userId when editing
            serviceName: service.serviceName,
            description: service.description,
            price: service.price,
            timeSlots: service.timeSlots,
            availability: service.availability,
        });
        setShowForm(true); // Show form for editing
    };


    const handleCancel = () => {
        setEditingService(null);
        setNewService({ userId: '', serviceName: '', description: '', price: 0, timeSlots: [], availability: [] });
        setShowForm(false); // Hide form
    };



    return (
        <div>
            <div className="flex justify-between items-center">
                <div className='flex gap-2 items-center'>
                    <span className='h-3 w-3 rounded bg-primary-500 ml-3'></span>
                    <h1 className="font-semibold text-base">Services</h1>
                </div>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger onClick={() => {
                            setEditingService(null);
                            setNewService({ userId: '', serviceName: '', description: '', price: 0, timeSlots: [], availability: [] });
                            setShowForm(true); // Show form for adding new service
                        }}>
                            <CiSquarePlus className='size-[35px] text-text-500 cursor-pointer hover:scale-95 hover:text-text-300' />
                        </TooltipTrigger>
                        <TooltipContent className="rounded-[8px] bg-primary-500 text-text-50">
                            <p className="text-[10px]">Add Services</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            {showForm ? (
                <div className='flex w-full justify-center'>
                    <ServiceForm
                        newService={newService}
                        setNewService={setNewService}
                        handleAddService={handleAddService}
                        handleUpdateService={handleUpdateService}
                        editingService={editingService}
                        onCancel={handleCancel} // Pass the cancel function to ServiceForm
                    />
                </div>
            ) : (
                <ServiceList
                    services={services}
                    showMore={showMore}
                    setShowMore={setShowMore}
                    handleEditService={handleEditService}
                    handleDeleteService={handleDeleteService}
                    handleDragEnd={handleDragEnd} // Ensure this prop is passed
                />
            )}
        </div>
    );
};

export default ServiceManagementComponent;
