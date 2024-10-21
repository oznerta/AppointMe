import React, { useState } from 'react';
import { Service } from './ServiceTypes';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { IoMdAdd } from "react-icons/io";
import { RiDeleteBin6Line } from "react-icons/ri";

interface ServiceFormProps {
    newService: Omit<Service, 'id' | 'order' | 'bookingsCount' | 'clicksCount'>;
    setNewService: React.Dispatch<React.SetStateAction<Omit<Service, 'id' | 'order' | 'bookingsCount' | 'clicksCount'>>>;
    handleAddService: () => void;
    handleUpdateService: () => void;
    editingService: Service | null;
    onCancel: () => void;
}

const ServiceForm: React.FC<ServiceFormProps> = ({
    newService,
    setNewService,
    handleAddService,
    handleUpdateService,
    editingService,
    onCancel,
}) => {
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!newService.serviceName) newErrors.serviceName = "Service name is required.";
        if (!newService.description) newErrors.description = "Description is required.";
        if (newService.price <= 0) newErrors.price = "Price must be greater than zero.";
        if (newService.timeSlots.length === 0) newErrors.timeSlots = "At least one time slot is required.";
        if (newService.availability.length === 0) newErrors.availability = "At least one day must be selected.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            if (editingService) {
                handleUpdateService();
            } else {
                handleAddService();
            }
        }
    };

    return (
        <div className="w-full max-w-lg mx-auto">
            <h1 className='text-center text-lg font-medium mb-4'>
                {editingService ? 'Edit Service' : 'Add Service'}
            </h1>
            <div className="space-y-4">
                {/* Service Name */}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="serviceName">Service Name</Label>
                    <div className="col-span-3">
                        <Input
                            id="serviceName"
                            value={newService.serviceName}
                            onChange={(e) => {
                                setNewService({ ...newService, serviceName: e.target.value });
                                setErrors((prev) => ({ ...prev, serviceName: '' })); // Clear error on change
                            }}
                        />
                        {errors.serviceName && <span className="text-red-500 text-sm">{errors.serviceName}</span>}
                    </div>
                </div>

                {/* Description */}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description">Description</Label>
                    <div className="col-span-3">
                        <Input
                            id="description"
                            value={newService.description}
                            onChange={(e) => {
                                setNewService({ ...newService, description: e.target.value });
                                setErrors((prev) => ({ ...prev, description: '' })); // Clear error on change
                            }}
                        />
                        {errors.description && <span className="text-red-500 text-sm">{errors.description}</span>}
                    </div>
                </div>

                {/* Price */}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="price">Price</Label>
                    <div className="col-span-3">
                        <Input
                            type="number"
                            id="price"
                            value={newService.price}
                            onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                setNewService({ ...newService, price: value });
                                setErrors((prev) => ({ ...prev, price: '' })); // Clear error on change
                            }}
                        />
                        {errors.price && <span className="text-red-500 text-sm">{errors.price}</span>}
                    </div>
                </div>

                {/* Time Slots */}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="timeSlots">Time Slots</Label>
                    <div className="col-span-3 space-y-2">
                        {newService.timeSlots.map((slot, index) => (
                            <div key={index} className="flex space-x-2 items-center">
                                <Input
                                    type="time"
                                    value={slot.start}
                                    onChange={(e) => {
                                        const updatedSlots = [...newService.timeSlots];
                                        updatedSlots[index].start = e.target.value;
                                        setNewService({ ...newService, timeSlots: updatedSlots });
                                    }}
                                />
                                <Input
                                    type="time"
                                    value={slot.end}
                                    onChange={(e) => {
                                        const updatedSlots = [...newService.timeSlots];
                                        updatedSlots[index].end = e.target.value;
                                        setNewService({ ...newService, timeSlots: updatedSlots });
                                    }}
                                />
                                <RiDeleteBin6Line
                                    onClick={() => {
                                        const updatedSlots = [...newService.timeSlots];
                                        updatedSlots.splice(index, 1);
                                        setNewService({ ...newService, timeSlots: updatedSlots });
                                    }}
                                    className='h-14 w-14 cursor-pointer text-red-500 hover:text-red-300'
                                />
                            </div>
                        ))}
                        <div className='flex items-center gap-2 bg-primary-500 justify-center py-2 rounded-[8px] text-teal-50 cursor-pointer hover:bg-primary-300' onClick={() => setNewService({
                            ...newService,
                            timeSlots: [...newService.timeSlots, { start: '00:00', end: '00:00' }]
                        })}>
                            <IoMdAdd />
                            <span>Add Time Slot</span>
                        </div>
                        {errors.timeSlots && <span className="text-red-500 text-sm">{errors.timeSlots}</span>}
                    </div>
                </div>

              
                {/* Availability */}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="availability">Availability</Label>
                    <div className="col-span-3 flex flex-wrap gap-2">
                        {daysOfWeek.map((day) => (
                            <label key={day} className="flex items-center space-x-2">
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
                                />
                                <span>{day.slice(0, 2)}</span>
                            </label>
                        ))}
                        {errors.availability && <span className="text-red-500 text-sm">{errors.availability}</span>}
                    </div>
                </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end mt-6 space-x-4">
                <Button onClick={onCancel} variant={'outline'} className='rounded-[8px] px-4 py-6'>Cancel</Button>
                <Button onClick={handleSubmit}>
                    {editingService ? 'Update Service' : 'Add Service'}
                </Button>
            </div>
        </div>
    );
};

export default ServiceForm;
