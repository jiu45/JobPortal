import{
    Search,
    Users,
    FileText,
    MessageSquare,
    BarChart3,
    Shield,
    Clock,
    Award,
    Briefcase,
    Building2,
    LayoutDashboard,
    MessageCircle,
    Plus,
} from "lucide-react";

export const jobSeekerFeatures = [
    {
        icon: Search,
        title: "Smart Job Matching",
        description:"AI-powered algorithms match you with jobs that fit your skills and preferences."
    },

    {
        icon: FileText,
        title: "Resume Builder",
        description:"Create a professional resume in minutes with our easy-to-use builder."
    },
    {
        icon: MessageSquare,
        title: "Direct Communication",
        description:"Connect directly with employers through our secure messaging platform."
    },
    {
        icon:  Award,
        title: "Skill Assessments",
        description:"Showcase your skills with our industry-recognized assessments."
    }
];

export const employerFeatures = [
    {
        icon: Users,
        title: "Talent Pool Access",
        description:"Access a vast database of qualified candidates to find the perfect fit for your company."
    },
    {
        icon: BarChart3,
        title: "Analytics Dashboard",
        description:"Track your hiring performance with detailed analytics and reports."
    },
    {
        icon: Shield,
        title: "Verified Candidates",
        description:"All candidates are verified to ensure authenticity and reliability."
    },
    {
        icon: Clock,
        title: "Quick Hiring",
        description:"Streamline your hiring process with our efficient tools and features."
    },
];

//Navigation items configuration
export const NAVIGATION_MENU=[
    {id:"employer-dashboard", label:"Dashboard", icon:LayoutDashboard},
    {id:"post-job", label:"Post a Job", icon:Plus},
    {id:"manage-jobs", label:"Manage Jobs", icon:Briefcase},
    {id:"company-profile", label:"Company Profile", icon:Building2},
    {id:"messages", label:"Message", icon:MessageCircle},
];
//Categories for job listings
export const CATEGORIES=[
    {value:"Engineering", label:"Engineering"},
    {value:"Design", label:"Design"},
    {value:"Marketing", label:"Marketing"},
    {value:"Sales", label:"Sales"},
    {value:"Customer Support", label:"Customer Support"},
    {value:"Human Resources", label:"Human Resources"},
    {value:"Finance", label:"Finance"},
    {value:"Education", label:"Education"},
    {value:"Healthcare", label:"Healthcare"},
    {value:"IT & Software", label:"IT & Software"},
    {value:"Legal", label:"Legal"},
    {value:"Operations", label:"Operations"},
    {value:"Other", label:"Other"}
];
export const JOB_TYPE=[
    {value:"Full-time", label:"Full-time"},
    {value:"Part-time", label:"Part-time"},
    {value:"Remote", label:"Remote"},
    {value:"Contract", label:"Contract"},
    {value:"Internship", label:"Internship"},
];

export const SALARY_RANGES=[
    "Less than $1000",
    "$1000 - $15000",
    "More than $15000"
];