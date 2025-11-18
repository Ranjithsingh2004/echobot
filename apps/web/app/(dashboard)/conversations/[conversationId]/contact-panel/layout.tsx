import { ContactPanelLayout } from "@/modules/dashboard/ui/layouts/contact-panel-layout";

const Layout = ({
  children
}: { children: React.ReactNode; }) => {
  return <ContactPanelLayout>{children}</ContactPanelLayout>;
};

export default Layout;
