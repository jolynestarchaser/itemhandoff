import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Inventory Handoff | ระบบส่งมอบรถเข็นโรงพยาบาล',
    short_name: 'Inventory Handoff',
    description: 'ระบบสแกน QR Code และจัดการส่งมอบรถเข็นโรงพยาบาล ตรวจสอบเลขรถ และพิมพ์เอกสารส่งมอบ',
    start_url: '/',
    display: 'standalone',
    background_color: '#121212',
    theme_color: '#F58220',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
