import React, { useEffect, useState } from 'react';
import { doc, onSnapshot, collection, getDoc, query, where } from 'firebase/firestore'; // Firestore methods
import { useParams } from 'react-router-dom'; // Get uniqueLink from URL params
import { FaInstagram } from 'react-icons/fa';
import { ScrollArea } from "@/components/ui/scroll-area";
import { FaXTwitter } from "react-icons/fa6";
import { SlSocialFacebook } from "react-icons/sl";
import { RiTiktokLine } from "react-icons/ri";
import { HiOutlineMail } from "react-icons/hi";
import logo from '../../../public/assets/images/logo.png'; // Adjust path to your logo
import { db } from '@/lib/firebase/config';
import ServiceDetails from '@/components/SharedComponents/ServicesComponents/ServiceDetails'; // Import ServiceDetails
import AppointmentScheduler from '@/components/SharedComponents/AppointmentScheduler'; // Import AppointmentScheduler

interface TimeSlot {
    start: string;
    end: string;
}

interface SocialLink {
    platform: string;
    url: string;
    order: number;
}

interface Service {
    serviceId: string;  // Ensure this is the auto-generated doc ID
    serviceName: string;
    description: string;
    price: number;
    timeSlots: TimeSlot[];
    order: number;
    availability: string[];
    bookingsCount: number;  // Include other relevant fields
    clicksCount: number;
    createdAt: Date; // Adjust type based on Firestore data
}


const MerchantWebpage: React.FC = () => {
    const { uniqueLink } = useParams(); // Get unique merchant link from URL params
    const [brandName, setBrandName] = useState('');
    const [brandLogo, setBrandLogo] = useState('');
    const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [currentStep, setCurrentStep] = useState<'details' | 'scheduler'>('details');
    const [merchantId, setMerchantId] = useState<string | null>(null);

    useEffect(() => {
        if (!uniqueLink) return; // Exit if uniqueLink is not defined
        console.log('Unique Link:', uniqueLink);

        const fetchMerchantDetails = async () => {
            const linkDocRef = doc(db, 'merchantLinks', uniqueLink);
            const linkDocSnapshot = await getDoc(linkDocRef);
        
            if (linkDocSnapshot.exists()) {
                const merchantData = linkDocSnapshot.data();
                const userId = merchantData.userId; // Get userId from the merchantData
        
                setBrandName(merchantData.brandName || '');
                setMerchantId(userId); // Set the merchantId here
        
                // Fetch additional info like brandLogo from the users collection
                const merchantDocRef = doc(db, 'users', userId);
                const merchantDoc = await getDoc(merchantDocRef);
                if (merchantDoc.exists()) {
                    const merchantInfo = merchantDoc.data();
                    setBrandLogo(merchantInfo?.brandLogo || '');
                }
        
                // Fetch social links based on userId
                const socialLinksDocRef = doc(db, 'socialLinks', userId);
                const socialLinksDocSnapshot = await getDoc(socialLinksDocRef);
                const socialLinksData = socialLinksDocSnapshot.data() || {};
        
                const links: SocialLink[] = [];
                Object.keys(socialLinksData).forEach(key => {
                    if (key.endsWith('Order')) return;
                
                    let url = socialLinksData[key] as string;
                    if (!url.startsWith('http://') && !url.startsWith('https://')) {
                        url = `https://${url}`; // Prepend https:// if missing
                    }
                    if (key === 'email') {
                        url = `mailto:${url}?subject=Inquiry from ${merchantData.brandName}`;
                    }
                
                    links.push({
                        platform: key,
                        url,
                        order: socialLinksData[`${key}Order`] as number,
                    });
                });

                links.sort((a, b) => a.order - b.order);
                setSocialLinks(links);
        
                // Fetch services for this specific userId
                fetchServices(userId);
            } else {
                console.error('Merchant link document does not exist');
            }
        };
        

        // Fetch services
        const fetchServices = async (userId: string) => {
            const servicesCollection = collection(db, 'services');
            const q = query(servicesCollection, where('userId', '==', userId));
        
            const unsubscribeServices = onSnapshot(q, (snapshot) => {
                const serviceList: Service[] = snapshot.docs.map(doc => ({
                    serviceId: doc.id,  // Correctly set serviceId to the document ID
                    ...doc.data() as Omit<Service, 'serviceId'>,
                    createdAt: doc.data().createdAt.toDate(), // Convert Firestore timestamp to JS Date if needed
                }));
                serviceList.sort((a, b) => a.order - b.order);
                setServices(serviceList); 
            });
        
            return unsubscribeServices; 
        };
        

        fetchMerchantDetails();
    }, [uniqueLink]);

    // Function to get the correct social media icon
    const getSocialIcon = (platform: string, size: string = 'h-7 w-7') => {
        switch (platform) {
            case 'facebook':
                return <SlSocialFacebook className={size} />;
            case 'instagram':
                return <FaInstagram className={size} />;
            case 'twitter':
                return <FaXTwitter className={size} />;
            case 'tiktok':
                return <RiTiktokLine className={size} />;
            case 'email':
                return <HiOutlineMail className={size} />;
            default:
                return null;
        }
    };

    // Handle service selection
    const handleServiceClick = (service: Service) => {
        setSelectedService(service);
    };

    // Close service details
    const handleCloseServiceDetails = () => {
        setSelectedService(null);
        setCurrentStep('details'); // Reset to details view
    };

    // Handle appointment scheduling
    const handleNext = (customerName: string, customerEmail: string, selectedDate: Date | null, selectedTimeSlot: string) => {
        console.log(`Customer Name: ${customerName}, Email: ${customerEmail}, Date: ${selectedDate}, Time Slot: ${selectedTimeSlot}`);
    };

    return (
        <div className="max-h-[100vh] w-full flex items-center justify-center relative overflow-hidden">
            <div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(circle, rgba(152,152,152,1) 4%, rgba(255,255,255,1) 50%), rgb(152,152,152)',
                }}
            />
            <div className="w-full h-[100vh] flex flex-col">
                <ScrollArea className='h-full scrollbar-hidden scrollable'>
                    <div className='flex flex-col items-center'>
                        <div className='flex flex-col justify-center items-center mb-6'>
                            {brandLogo && (
                                <div className="relative w-24 h-24 rounded-full overflow-hidden mt-20 mb-4">
                                    <img src={brandLogo} alt={`${brandName} Logo`} className="object-cover w-full h-full" />
                                </div>
                            )}
                            {brandName && <h1 className="text-center font-bold text-2xl">{brandName}</h1>}
                        </div>
    
                        <div className="flex gap-8 justify-center mb-8">
                            {socialLinks.map(social => (
                                <a key={social.platform} href={social.url} target="_blank" rel="noopener noreferrer" className="flex items-center hover:scale-95">
                                    {getSocialIcon(social.platform)}
                                </a>
                            ))}
                        </div>
    
                        {currentStep === 'details' && selectedService ? (
                            <ServiceDetails
                                service={selectedService}
                                onClose={handleCloseServiceDetails}
                                onNext={handleNext}
                                merchantId={merchantId || ''}
                            />
                        ) : currentStep === 'scheduler' && selectedService ? (
                            <AppointmentScheduler 
                                service={selectedService}
                                onClose={handleCloseServiceDetails}
                                onNext={handleNext}
                            />
                        ) : (
                            <div className='w-[500px]'>
                                <h2 className="font-semibold mb-5 text-lg text-center">Select Appointment</h2>
                                <div className='mb-44'>
                                    {services.map(service => (
                                        <div
                                            key={service.serviceId}
                                            onClick={() => handleServiceClick(service)}
                                            className="mb-4 p-4 bg-primary-50 rounded cursor-pointer transform transition-transform duration-300 hover:scale-[1.03] hover:shadow-lg overflow-hidden"
                                        >
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h3 className="font-semibold text-base">{service.serviceName}</h3>
                                                </div>
                                                <div className="px-6 py-3 rounded">
                                                    <h3 className="font-semibold text-base">Book Now</h3>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
    
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent via-gray-100 to-white/90 blur-sm pointer-events-none"></div>
    
                <div className="absolute bottom-0 left-0 right-0 flex justify-center mb-2 items-center gap-1">
                    <img src={logo} alt="Appoint.Me Logo" className="h-4 object-contain" />
                    <p className="text-xs font-semibold">Appoint.Me</p>
                </div>
            </div>
        </div>
    );
    
}

export default MerchantWebpage;
