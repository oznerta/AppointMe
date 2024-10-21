// ServicesComponents/ServiceList.tsx

import React from 'react';
import { ServiceWithDragListeners } from './ServiceTypes';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DndContext } from '@dnd-kit/core';
import SortableItem from '../SortableItem'; // Adjust according to your project structure
import { FiEdit2 } from 'react-icons/fi';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { FaDollarSign, FaUsers } from 'react-icons/fa';
import { BsInfoCircleFill } from 'react-icons/bs';


interface ServiceListProps {
    services: ServiceWithDragListeners[];
    showMore: { [key: string]: boolean };
    setShowMore: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
    handleEditService: (service: ServiceWithDragListeners) => void;
    handleDeleteService: (id: string) => void;
    handleDragEnd: (event: any) => void; // Adjust the event type accordingly
}

const ServiceList: React.FC<ServiceListProps> = ({
    services,
    showMore,
    setShowMore,
    handleEditService,
    handleDeleteService,
    handleDragEnd,
}) => {
    return (
        <DndContext onDragEnd={handleDragEnd}>
            <SortableContext items={services.map((service) => service.id)} strategy={verticalListSortingStrategy}>
                <div className='service-container cursor-default'>
                    {services.map((service) => (
                        <SortableItem key={service.id} id={service.id}>
                            <div className="flex relative bg-primary-50 px-10 py-6 rounded-xl shadow-md cursor-default mb-6">
                                <div className="flex flex-col justify-between h-full absolute top-0 right-0 px-6 py-6">
                                    <FiEdit2
                                        className="ml-2 cursor-pointer text-primary-500 hover:text-primary-300 text-xl"
                                        onClick={() => handleEditService(service)}
                                    />
                                    <RiDeleteBin6Line
                                        className="ml-2 cursor-pointer text-red-500 hover:text-red-300 text-xl"
                                        onClick={() => handleDeleteService(service.id)}
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <div className="mb-2">
                                        <h2 className="font-semibold">{service.serviceName}</h2>
                                        <p>{service.description}</p>
                                    </div>

                                    <div className="flex mt-2 items-center">
                                        <div className="flex items-center mr-28">
                                            <button
                                                className="flex items-center text-primary-500 hover:text-primary-300 focus:outline-none text-xs"
                                                onClick={() => setShowMore(prev => ({ ...prev, [service.id]: !prev[service.id] }))}
                                            >
                                                <BsInfoCircleFill className="mr-1 text-xs" />
                                                {showMore[service.id] ? 'Hide Info' : 'More Info'}
                                            </button>
                                        </div>

                                        <div className="flex items-center mr-28 text-xs">
                                            <FaDollarSign />
                                            <span>Fee: {service.price}</span>
                                        </div>

                                        <div className="flex items-center mr-28 text-xs">
                                            <FaUsers className="text-black mr-1" />
                                            <span>Booked: {service.bookingsCount}</span>
                                        </div>

                                        
                                    </div>
                                </div>
                            </div>

                            {showMore[service.id] && (
                                <div className="text-sm text-gray-600 bg-primary-100 mt-[-10px] px-10 py-6 rounded-b-xl z-50">
                                    <p>Available Time Slots:</p>
                                    {service.timeSlots.map((slot, index) => (
                                        <p key={index}>From: {slot.start} to {slot.end}</p>
                                    ))}
                                    <p>Available on: {service.availability.join(', ')}</p>
                                </div>
                            )}
                        </SortableItem>
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
};

export default ServiceList;
