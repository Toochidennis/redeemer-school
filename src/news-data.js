export const DEFAULT_NEWS_POSTS = [
  {
    id: 'news-1',
    slug: 'admission-enquiries-open',
    category: 'Admissions',
    title: 'Admission enquiries are open',
    summary: 'Parents and guardians can contact the school office for admission guidance into Junior and Senior Secondary classes.',
    content: 'Redeemers International Secondary School, Enugu welcomes admission enquiries from parents and guardians. The admissions team guides families through class placement, entrance assessment information, and registration steps for Junior and Senior Secondary students.',
    image: 'redeemers/optimized/campus.webp',
    imageLabel: 'School campus',
    status: 'Published',
    updatedAt: '2026-07-14T10:00:00+01:00'
  },
  {
    id: 'news-2',
    slug: 'learning-in-the-classroom',
    category: 'Academics',
    title: 'Learning in the classroom',
    summary: 'Classroom teaching remains central to academic excellence and learner development at RISE.',
    content: 'The classroom environment at Redeemers International Secondary School supports daily lessons, guided practice, assessment, and teacher attention. Learners are encouraged to build confidence, discipline, and steady academic habits.',
    image: 'redeemers/optimized/classroom.webp',
    imageLabel: 'Classroom',
    status: 'Published',
    updatedAt: '2026-07-14T10:00:00+01:00'
  },
  {
    id: 'news-3',
    slug: 'practical-learning-and-student-development',
    category: 'School Life',
    title: 'Practical learning and student development',
    summary: 'RISE continues to develop academic, arts, and extra-curricular programmes that strengthen students.',
    content: 'Students learn through classroom work, practical exposure, arts, and extra-curricular activities that support confidence, discipline, and strength of character.',
    image: 'redeemers/optimized/laboratory.webp',
    imageLabel: 'Laboratory',
    status: 'Published',
    updatedAt: '2026-07-14T10:00:00+01:00'
  },
  {
    id: 'news-4',
    slug: 'knowledge-and-the-fear-of-the-lord',
    category: 'Notice',
    title: 'Knowledge and the fear of the Lord',
    summary: 'The school motto remains central to the RISE identity and learning culture.',
    content: 'Redeemers International Secondary School is guided by the motto “Knowledge and the fear of the Lord.” This reflects the school’s commitment to academic excellence, faith, discipline, and sound moral values.',
    image: 'redeemers/optimized/badge.webp',
    imageLabel: 'School crest',
    status: 'Published',
    updatedAt: '2026-07-14T10:00:00+01:00'
  }
];

export const NEWS_IMAGE_OPTIONS = [
  { value: 'redeemers/optimized/campus.webp', label: 'School campus' },
  { value: 'redeemers/optimized/school-block.webp', label: 'School block' },
  { value: 'redeemers/optimized/classroom.webp', label: 'Classroom' },
  { value: 'redeemers/optimized/laboratory.webp', label: 'Laboratory' },
  { value: 'redeemers/optimized/practical-learning.webp', label: 'Practical learning' },
  { value: 'redeemers/optimized/excursion.webp', label: 'Guided practical visit' },
  { value: 'redeemers/optimized/skills-workshop.webp', label: 'Skills workshop' },
  { value: 'redeemers/optimized/badge.webp', label: 'School crest' }
];

export const NEWS_CATEGORIES = ['Admissions', 'Academics', 'School Life', 'Notice', 'Events'];
