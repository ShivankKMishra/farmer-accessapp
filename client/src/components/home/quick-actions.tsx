import { Link } from 'wouter';

interface QuickAction {
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  bgColor: string;
  link: string;
}

export default function QuickActions() {
  const actions: QuickAction[] = [
    {
      title: 'Marketplace',
      description: 'Buy & sell products',
      icon: 'shopping_basket',
      iconColor: 'text-[#2E7D32]',
      bgColor: 'bg-[#4caf50] bg-opacity-20',
      link: '/marketplace'
    },
    {
      title: 'Community',
      description: 'Discuss & learn',
      icon: 'forum',
      iconColor: 'text-[#8BC34A]',
      bgColor: 'bg-[#9CCC65] bg-opacity-20',
      link: '/community'
    },
    {
      title: 'Farm Manager',
      description: 'Track your crops',
      icon: 'grass',
      iconColor: 'text-[#795548]',
      bgColor: 'bg-[#A1887F] bg-opacity-20',
      link: '/farm-management'
    },
    {
      title: 'Bidding',
      description: 'Buy & sell in bulk',
      icon: 'gavel',
      iconColor: 'text-[#1976d2]',
      bgColor: 'bg-[#1976d2] bg-opacity-20',
      link: '/bidding'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {actions.map((action, index) => (
        <Link key={index} href={action.link}>
          <a className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 text-center cursor-pointer">
            <div className={`inline-flex items-center justify-center h-12 w-12 rounded-full ${action.bgColor} ${action.iconColor} mb-3 mx-auto`}>
              <span className="material-icons">{action.icon}</span>
            </div>
            <h3 className="font-poppins font-medium text-neutral-800">{action.title}</h3>
            <p className="text-sm text-neutral-600 mt-1">{action.description}</p>
          </a>
        </Link>
      ))}
    </div>
  );
}
