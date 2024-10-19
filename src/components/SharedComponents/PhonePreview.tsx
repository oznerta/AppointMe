import { useEffect, useState } from 'react';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase/config';
import { useAuth } from '../../context/AuthContext';
import { FaInstagram, FaFacebook, FaTwitter, FaTiktok, FaEnvelope } from 'react-icons/fa';
import { ScrollArea } from "@/components/ui/scroll-area"

interface Service {
    id: string;
    serviceName: string;
    description: string;
    order: number;
}

interface SocialLink {
    platform: string;
    url: string;
    order: number;
}

const PhonePreview = () => {
    const { user, userData } = useAuth();
    const [services, setServices] = useState<Service[]>([]);
    const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
    const [brandName, setBrandName] = useState('');
    const [brandLogo, setBrandLogo] = useState('');

    useEffect(() => {
        if (!user) return;

        const userId = user.uid;

        // Fetch services
        const servicesCollection = collection(db, 'services');
        const unsubscribeServices = onSnapshot(servicesCollection, (snapshot) => {
            const serviceList: Service[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data() as Omit<Service, 'id'>,
            }));
            serviceList.sort((a, b) => a.order - b.order);
            setServices(serviceList);
        });

        // Fetch social links for the authenticated user
        const socialLinksDocRef = doc(db, 'socialLinks', userId);
        const unsubscribeSocials = onSnapshot(socialLinksDocRef, (doc) => {
            const data = doc.data() || {};
            const links: SocialLink[] = [];

            Object.keys(data).forEach(key => {
                if (key.endsWith('Order')) return; // Skip order fields
                links.push({
                    platform: key,
                    url: data[key] as string,
                    order: data[`${key}Order`] as number,
                });
            });

            // Sort links based on order
            links.sort((a, b) => a.order - b.order);
            setSocialLinks(links);
        });

        // Fetch brand details
        if (userData) {
            setBrandName(userData.brandName || '');
            setBrandLogo(userData.brandLogo || '');
        }

        return () => {
            unsubscribeServices();
            unsubscribeSocials();
        };
    }, [user, userData]);

    const getSocialIcon = (platform: string, size: string = 'h-2 w-2') => {
        switch (platform) {
            case 'facebook':
                return <FaFacebook className={`${size}`} />;
            case 'instagram':
                return <FaInstagram className={`${size}`} />;
            case 'twitter':
                return <FaTwitter className={`${size}`} />;
            case 'tiktok':
                return <FaTiktok className={`${size}`} />;
            case 'email':
                return <FaEnvelope className={`${size}`} />;
            default:
                return null;
        }
    };
    

    return (
        <div className="relative flex justify-center h-[540px] w-[270px] border-4 border-primary-50 rounded-2xl bg-[radial-gradient(circle,rgba(105,105,105,0.4),rgba(169,169,169,0.5),transparent)]"
            style={{ boxShadow: '0px 0px 80px 30px rgb(209, 218, 218)' }}>

            <ScrollArea className='w-full p-4'>
                <div className='flex flex-col'>
                    {/* Brand Logo */}
                    <div className='mt-6'>
                        <div className='flex flex-col justify-center items-center'>
                            {brandLogo && <img src={brandLogo} alt={`${brandName} Logo`} className="h-16 rounded-[100%] mb-2" />}
                            {brandName && <h1 className="text-center font-semibold text-sm">{brandName}</h1>}
                        </div>

                        <div className="flex gap-1 justify-center mt-4">
                            {socialLinks.map(social => (
                                <a key={social.platform} href={social.url} target="_blank" rel="noopener noreferrer" className="flex items-center hover:scale-95">
                                    {getSocialIcon(social.platform, 'h-4 w-5' )}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Services */}
                    <div className="flex flex-col w-full mt-6">
                        <h2 className="font-medium mb-4 text-sm text-center">Select Appointment</h2>
                        <div>
                            {services.map(service => (
                                <div key={service.id} className="flex justify-between items-center mb-1 bg-primary-50 gap-4 p-2 rounded">
                                    <h3 className="font-medium text-xs">{service.serviceName}</h3>

                                    <div className='bg-black text-white p-2 rounded cursor-pointer hover:scale-95'>
                                        <h3 className='font-medium text-xs'>Book Now</h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Social Links */}
                    <div>

                    </div>
                </div>
            </ScrollArea>

            {/* Blurred Overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent via-gray-100 to-white/90 blur-sm pointer-events-none"></div>

            <div className="absolute bottom-0 left-0 right-0 flex justify-center mb-2 items-center gap-1">
                <img src="../../../public/assets/images/logo.png" alt="logo" className='h-9' />
                <h1 className='text-xs font-medium'>Appoint.Me</h1>
            </div>



        </div>
    );
};

export default PhonePreview;
