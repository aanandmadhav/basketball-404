export type Destination = {
  label: string
  href: string
  tone: 'rust' | 'ink' | 'sand' | 'moss' | 'clay' | 'blue'
  large?: boolean
}

// This is the main customization point. Change the labels and URLs to match your site.
export const DESTINATIONS: Destination[] = [
  { label: 'Home', href: 'https://aanandmadhav.com/', tone: 'rust' },
  { label: 'Work', href: 'https://aanandmadhav.com/work', tone: 'ink' },
  { label: 'Writing', href: 'https://aanandmadhav.com/writing', tone: 'sand', large: true },
  { label: 'Life', href: 'https://aanandmadhav.com/life', tone: 'moss' },
  { label: 'Lab', href: 'https://aanandmadhav.com/lab', tone: 'clay' },
  { label: 'Contact', href: 'https://aanandmadhav.com/contact?intent=project', tone: 'blue', large: true },
]
