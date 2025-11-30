import Link from 'next/link';
import Image from 'next/image';
import { FiCheckCircle } from 'react-icons/fi';
import Accordion from '@/components/Accordion';

interface Tool {
  id: string;
  title: string;
  location: string;
  image: string;
  description: string;
}

interface Plan {
  id: string;
  name: string;
  title: string;
  price: string;
  description: string;
  features: string[];
}

const TOOLS: Tool[] = [
  {
    id: '1',
    title: 'Split PDF',
    location: '/tool=',
    image: '/logo.svg',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque ac pellentesque metus. Maecenas porttitor hendrerit risus, nec hendrerit nisl efficitur in.',
  },
  {
    id: '2',
    title: 'Merge PDF',
    location: '/tool=',
    image: '/logo.svg',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque ac pellentesque metus. Maecenas porttitor hendrerit risus, nec hendrerit nisl efficitur in.',
  },
  {
    id: '3',
    title: 'Delete Page from PDF',
    location: '/tool=',
    image: '/logo.svg',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque ac pellentesque metus. Maecenas porttitor hendrerit risus, nec hendrerit nisl efficitur in.',
  },
  {
    id: '4',
    title: 'Compress PDF',
    location: '/tool=',
    image: '/logo.svg',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque ac pellentesque metus. Maecenas porttitor hendrerit risus, nec hendrerit nisl efficitur in.',
  },
  {
    id: '5',
    title: 'PNG to PDF',
    location: '/tool=',
    image: '/logo.svg',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque ac pellentesque metus. Maecenas porttitor hendrerit risus, nec hendrerit nisl efficitur in.',
  },
  {
    id: '6',
    title: 'JPEG to PDF',
    location: '/tool=',
    image: '/logo.svg',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque ac pellentesque metus. Maecenas porttitor hendrerit risus, nec hendrerit nisl efficitur in.',
  },
  {
    id: '7',
    title: 'Word to PDF',
    location: '/tool=',
    image: '/logo.svg',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque ac pellentesque metus. Maecenas porttitor hendrerit risus, nec hendrerit nisl efficitur in.',
  },
  {
    id: '8',
    title: 'PowerPoint to PDF',
    location: '/tool=',
    image: '/logo.svg',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque ac pellentesque metus. Maecenas porttitor hendrerit risus, nec hendrerit nisl efficitur in.',
  },
  {
    id: '9',
    title: 'Excel to PDF',
    location: '/tool=',
    image: '/logo.svg',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque ac pellentesque metus. Maecenas porttitor hendrerit risus, nec hendrerit nisl efficitur in.',
  },
];

const PLANS: Plan[] = [
  {
    id: '1',
    name: 'basic',
    title: 'Basic',
    price: 'Free',
    description: 'Perfect for individuals testing the platform',
    features: [
      'Limited number of tasks per day',
      'Upload documents up to 25 MB',
      'Basic document tools',
    ],
  },
  {
    id: '2',
    name: 'pro',
    title: 'Pro',
    price: '$4.99',
    description: 'Ideal for students, professionals and small companies',
    features: [
      'Unlimited number of tasks per day',
      'Upload documents up to 100 MB',
      'Basic and advanced tools',
    ],
  },
];

const FAQ = [
  {
    id: '1',
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce ex mauris, venenatis ac feugiat et, accumsan nec ante. Duis nisl justo, ornare ac erat ac, posuere auctor massa. Donec placerat orci quis sem tincidunt, at egestas justo porta. In hac habitasse platea dictumst. Pellentesque tincidunt arcu vel massa congue laoreet.',
  },
  {
    id: '2',
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce ex mauris, venenatis ac feugiat et, accumsan nec ante. Duis nisl justo, ornare ac erat ac, posuere auctor massa. Donec placerat orci quis sem tincidunt, at egestas justo porta. In hac habitasse platea dictumst. Pellentesque tincidunt arcu vel massa congue laoreet.',
  },
  {
    id: '3',
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce ex mauris, venenatis ac feugiat et, accumsan nec ante. Duis nisl justo, ornare ac erat ac, posuere auctor massa. Donec placerat orci quis sem tincidunt, at egestas justo porta. In hac habitasse platea dictumst. Pellentesque tincidunt arcu vel massa congue laoreet.',
  },
  {
    id: '4',
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce ex mauris, venenatis ac feugiat et, accumsan nec ante. Duis nisl justo, ornare ac erat ac, posuere auctor massa. Donec placerat orci quis sem tincidunt, at egestas justo porta. In hac habitasse platea dictumst. Pellentesque tincidunt arcu vel massa congue laoreet.',
  },
  {
    id: '5',
    title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce ex mauris, venenatis ac feugiat et, accumsan nec ante. Duis nisl justo, ornare ac erat ac, posuere auctor massa. Donec placerat orci quis sem tincidunt, at egestas justo porta. In hac habitasse platea dictumst. Pellentesque tincidunt arcu vel massa congue laoreet.',
  },
];

const ToolCard = ({ item }: { item: Tool }) => {
  return (
    <li className="my-2">
      <Link
        href={item.location}
        className="rounded-lg border-2 border-gray-200 hover:border-primary-200 flex flex-col w-[280] h-[280] p-4 bg-gray-50"
      >
        <Image src={item.image} alt="tool" width={60} height={60} />
        <h3 className="!text-gray-600 mb-4">{item.title}</h3>
        <p className="text-xs overflow-ellipsis text-gray-600 line-clamp-4">
          {item.description}
        </p>
      </Link>
    </li>
  );
};

const PlanCard = ({ item }: { item: Plan }) => {
  return (
    <div className="flex flex-1 mt-5 border-2 border-gray-200 h-[400] shadow p-5 transition-all hover:shadow-lg hover:-translate-y-1.5 ">
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h2 className="mb-2">{item.title}</h2>
          <h4 className="mb-2">{item.price}</h4>
          <p className="text-lg text-gray-600 mb-2">{item.description}</p>
          <ul className="gap-2">
            {item.features.map((feature, index) => (
              <li key={index.toString()} className="flex items-center gap-2">
                <FiCheckCircle size={15} />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <Link
          className="button-primary flex justify-center text-lg align-bottom mt-5"
          href="#"
        >
          Subscribe
        </Link>
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <>
      {/* Logo */}
      <header className="flex justify-between px-7 py-3 shadow-sm items-center sticky">
        <Link href="/" className="flex justify-center items-center gap-0.5">
          <Image src="/logo.svg" width={24} height={24} alt="logo" />
          <h4 className="font-bold ms-0.5">Document Hero</h4>
        </Link>

        <div className="flex flex-wrap items-center gap-1.5 bg-">
          <Link href="#" className="button-primary">
            {'Sign In'}
          </Link>
          <Link href="#" className="button-primary">
            {'Register'}
          </Link>
        </div>
      </header>
      <main>
        {/* Hero */}
        <section className="shadow-sm section">
          <div className="flex items-center justify-evenly">
            <div className="flex-col">
              <h1>The All-in-One PDF Toolkit</h1>
              <h3 className="mb-4">
                Convert, merge, split, compress, and edit your PDFs — all in one
                simple web app.
              </h3>
              <Link className="button-primary md:text-2xl" href="#">
                Get Started
              </Link>
            </div>
            <div>
              <Image
                src="/hero.png"
                className="hidden md:block"
                width={600}
                height={600}
                alt="hero"
              />
            </div>
          </div>
        </section>

        {/* Tools */}
        <section className="section">
          <div className="flex flex-col items-center mt-5 ">
            <h1>Tools</h1>
            <ul className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
              {TOOLS.map((item) => (
                <ToolCard key={item.id} item={item} />
              ))}
            </ul>
          </div>
        </section>

        {/* Pricing */}
        <section className="section">
          <div className="flex flex-col items-center">
            <h1 className="">Plans</h1>
            <h1 className="font-sans font-normal">Plans</h1>
            <div className="flex flex-col md:flex-row items-stretch gap-8 ">
              {PLANS.map((plan) => (
                <PlanCard key={plan.id} item={plan} />
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section">
          <div className="flex flex-col items-center">
            <h1>FAQ</h1>
            <div className="flex flex-col w-2/3">
              {FAQ.map((item) => (
                <Accordion key={item.id} title={item.title} text={item.text} />
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t-1 border-gray-200">
        <section className="section pt-8 flex justify-between">
          <div className="flex gap-2">
            <Link href={'#'} className="text-sm hover:border-b-1">
              Terms and Conditions
            </Link>
            <Link href={'#'} className="text-sm hover:border-b-1">
              Privacy Policy
            </Link>
          </div>
          <span className="text-sm">© 2025 Document Hero</span>
        </section>
      </footer>
    </>
  );
}
