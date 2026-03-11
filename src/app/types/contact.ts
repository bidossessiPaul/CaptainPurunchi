export interface ContactInfo {
  id: string;
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
  facebook: string;
  instagram: string;
  hours1Label: string;
  hours1Value: string;
  hours2Label: string;
  hours2Value: string;
  hours3Label: string;
  hours3Value: string;
  footerDesc: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
