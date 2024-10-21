import { useEffect, useState } from 'react'; 
import { updateDoc, doc, getDoc, setDoc, deleteField } from 'firebase/firestore';
import { db } from '../../lib/firebase/config';
import { getAuth } from 'firebase/auth';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CiSquarePlus } from 'react-icons/ci';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RiDeleteBin6Line } from "react-icons/ri";
import { FiEdit2 } from "react-icons/fi";
import { FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";
import { SlSocialFacebook } from "react-icons/sl";
import { RiTiktokLine } from "react-icons/ri";
import { HiOutlineMail } from "react-icons/hi";

interface SocialMediaLink {
  platform: keyof Omit<SocialMediaLinks, 'id'>; // Exclude 'id' from the keys
  link: string;
  order: number; 
}

interface SocialMediaLinks {
  id: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  email?: string;
  tiktok?: string;
  instagramOrder?: number;
  facebookOrder?: number;
  twitterOrder?: number;
  emailOrder?: number;
  tiktokOrder?: number;
}

const orderKeys: {
  [key in keyof Omit<SocialMediaLinks, 'id'>]: `${key}Order`;
} = {
  instagram: 'instagramOrder',
  facebook: 'facebookOrder',
  twitter: 'twitterOrder',
  email: 'emailOrder',
  tiktok: 'tiktokOrder',
};

function SocialMediaManagement() {
  const MAX_SOCIAL_LINKS = 4;
  const [socialLinks, setSocialLinks] = useState<SocialMediaLink[]>([]);
  const [newLink, setNewLink] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<keyof Omit<SocialMediaLinks, 'id'> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const fetchSocialLinks = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      try {
        const socialLinksDocRef = doc(db, 'socialLinks', user.uid);
        const docSnapshot = await getDoc(socialLinksDocRef);

        if (docSnapshot.exists()) {
          const data = docSnapshot.data() as Record<string, string | number | undefined>;
          const linksArray: SocialMediaLink[] = Object.entries(data)
            .filter(([key, value]) => typeof value === 'string' && key in orderKeys)
            .map(([key, value]) => {
              const platformKey = key as keyof Omit<SocialMediaLinks, 'id'>;
              const orderKey = orderKeys[platformKey]; 
              const order = orderKey ? (data[orderKey] ?? 0) : 0;

              return {
                platform: platformKey,
                link: value as string,
                order: order as number,
              };
            });

          linksArray.sort((a, b) => a.order - b.order);
          setSocialLinks(linksArray);
        }
      } catch (error) {
        console.error('Error fetching social links:', error);
      }
    }
  };

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  const handleAddOrUpdateSocialLink = async () => {
    if (selectedPlatform && newLink) {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          const socialLinksDocRef = doc(db, 'socialLinks', user.uid);
          
          // Filter out the existing link if it is being updated
          const updatedLinks = socialLinks.filter(link => link.platform !== selectedPlatform);
          updatedLinks.push({ platform: selectedPlatform, link: newLink, order: updatedLinks.length });
  
          // Sort the links by their order
          updatedLinks.sort((a, b) => a.order - b.order);
          
          // Update the order property for all links
          const dataToSave: Partial<SocialMediaLinks> = {
            ...Object.fromEntries(updatedLinks.map(link => [link.platform, link.link] as [keyof Omit<SocialMediaLinks, 'id'>, string])),
            ...Object.fromEntries(updatedLinks.map((link, index) => [orderKeys[link.platform], index] as [keyof SocialMediaLinks, number])),
          };
  
          await setDoc(socialLinksDocRef, dataToSave);
          setSocialLinks(updatedLinks);
          resetForm();
        }
      } catch (error) {
        console.error('Error adding/updating social link:', error);
      }
    }
  };

  const resetForm = () => {
    setNewLink(''); 
    setDialogOpen(false);
    setSelectedPlatform(null);
    setEditMode(false);
  };

  const openDialog = (platform?: keyof Omit<SocialMediaLinks, 'id'>) => {
    setEditMode(!!platform);
    setSelectedPlatform(platform || null);
    
    if (platform) {
      const existingLink = socialLinks.find(link => link.platform === platform);
      setNewLink(existingLink ? existingLink.link : '');
    } else {
      setNewLink('');
    }

    setDialogOpen(true);
  };

  const handleDelete = async (platform: keyof Omit<SocialMediaLinks, 'id'>) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      try {
        const socialLinksDocRef = doc(db, 'socialLinks', user.uid);
        const updatedLinks = socialLinks.filter(link => link.platform !== platform);
  
        const orderKey = orderKeys[platform];
        if (orderKey) {
          await updateDoc(socialLinksDocRef, {
            [platform]: deleteField(),
            [orderKey]: deleteField(),
          });
  
          updatedLinks.forEach((link, index) => {
            link.order = index; // Set order correctly
          });
  
          const dataToSave: Partial<SocialMediaLinks> = {
            ...Object.fromEntries(updatedLinks.map(link => [link.platform, link.link] as [keyof Omit<SocialMediaLinks, 'id'>, string])),
            ...Object.fromEntries(updatedLinks.map(link => [orderKeys[link.platform], link.order] as [keyof SocialMediaLinks, number])),
          };
  
          await setDoc(socialLinksDocRef, dataToSave);
          setSocialLinks(updatedLinks);
        }
      } catch (error) {
        console.error('Error deleting social link:', error);
      }
    }
  };

  const getAvailableSocials = () => {
    const allSocials = ['instagram', 'facebook', 'twitter', 'tiktok', 'email'] as const;
    return allSocials.filter(social => !socialLinks.some(link => link.platform === social));
  };

  return (
    <div className='mb-10'>
      <div className="flex justify-between mt-6">
        <div className='flex gap-2 items-center'>
          <span className='h-3 w-3 rounded bg-primary-500 ml-3'></span>
          <h1 className="font-semibold text-base">Socials</h1>
        </div>
        <div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger onClick={() => openDialog()} disabled={socialLinks.length >= MAX_SOCIAL_LINKS}>
                <CiSquarePlus className={`size-[35px] text-text-500 cursor-pointer hover:scale-95 hover:text-text-300 ${socialLinks.length >= MAX_SOCIAL_LINKS ? 'text-gray-300 cursor-not-allowed' : ''}`} />
              </TooltipTrigger>
              <TooltipContent className="rounded-[8px] bg-primary-500 text-text-50">
                <p className="text-[10px]">
                  {socialLinks.length >= MAX_SOCIAL_LINKS ? 'Max 4 socials added' : 'Add Socials'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editMode ? 'Edit Social Link' : 'Add Social Link'}</DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            {/* Show the Select dropdown only if not in edit mode */}
            {!editMode && (
              <Select onValueChange={(value) => {
                setSelectedPlatform(value as keyof Omit<SocialMediaLinks, 'id'>);
                setNewLink('');
              }}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Social Media" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableSocials().map((social) => (
                    <SelectItem key={social} value={social}>
                      <div className="flex items-center">
                        {social === 'instagram' && <FaInstagram className="mr-2" />}
                        {social === 'facebook' && <SlSocialFacebook className="mr-2" />}
                        {social === 'twitter' && <FaXTwitter className="mr-2" />}
                        {social === 'tiktok' && <RiTiktokLine className="mr-2" />}
                        {social === 'email' && <HiOutlineMail className="mr-2" />}
                        {social}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {selectedPlatform && (
              <div className="mt-4">
                <Label htmlFor="newLinkInput">{editMode ? selectedPlatform : "Link"}</Label>
                <Input
                  id="newLinkInput"
                  placeholder={`Enter your ${selectedPlatform}`}
                  value={newLink}
                  onChange={e => setNewLink(e.target.value)}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={handleAddOrUpdateSocialLink} disabled={!selectedPlatform || !newLink}>
              {editMode ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div>
        {socialLinks.map(({ platform, link }) => (
          <div key={platform} className="flex items-center space-x-2 mb-2">
            <div className="relative w-full">
              <Input
                value={link}
                readOnly
                className="pl-10 pr-10 cursor-text bg-transparent border border-gray-300 rounded focus:outline-none focus:none"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                {platform === 'instagram' && <FaInstagram />}
                {platform === 'facebook' && <SlSocialFacebook />}
                {platform === 'twitter' && <FaXTwitter />}
                {platform === 'tiktok' && <RiTiktokLine />}
                {platform === 'email' && <HiOutlineMail />}
              </span>
            </div>
            <FiEdit2 className="ml-2 cursor-pointer text-primary-500 hover:text-primary-300 text-xl" onClick={() => openDialog(platform)} />
            <RiDeleteBin6Line className="ml-2 cursor-pointer text-red-500 hover:text-red-300 text-xl" onClick={() => handleDelete(platform)} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default SocialMediaManagement;
