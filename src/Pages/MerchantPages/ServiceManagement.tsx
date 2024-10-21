

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import SocialMediaManagement from '@/components/SharedComponents/SocialMediaManagement';
import ServiceManagementComponent from '@/components/SharedComponents/ServicesComponents/ServiceManagementComponent';
import { ScrollArea } from "@/components/ui/scroll-area"
import PhonePreview from "@/components/SharedComponents/PhonePreview";
import LinkGenerator from "@/components/SharedComponents/LinkGenerator";

function ServiceManagement() {
 
  
  const panelHeight = `calc(100vh - 120px)`;
  return (
    <ResizablePanelGroup direction="horizontal" style={{ height: panelHeight }}>
      <ResizablePanel defaultSize={65} minSize={50}>
      <ScrollArea className="p-6" style={{ height: panelHeight }}>
      <div>
      <h2 className="text-lg font-semibold">Service Management</h2>
          <SocialMediaManagement/>
          <ServiceManagementComponent />
        </div>
      </ScrollArea>
        
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={35} minSize={35} className='p-6'>
        <div className="flex flex-col justify-between h-full">
          <div>
            
          </div>
          <div className="flex items-center justify-center">
            <PhonePreview />
          </div>
          <div className="flex items-center justify-center">
            <LinkGenerator/>
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>




  );
}

export default ServiceManagement;
