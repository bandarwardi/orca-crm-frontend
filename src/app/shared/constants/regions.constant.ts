import { SelectOption } from '../components/form-controls';

export interface RegionOption extends SelectOption {
  code: string;
  country: 'US' | 'CA' | 'OTHER';
  nameEn: string;
  nameAr: string;
}

export const NORTH_AMERICA_REGIONS: RegionOption[] = [
  // Top Arab-American hubs first for quick selection
  {
    value: 'ميشيغان - MI',
    label: 'ميشيغان (MI) - Michigan',
    code: 'MI',
    country: 'US',
    nameAr: 'ميشيغان',
    nameEn: 'Michigan',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['MI', 'Michigan', 'ميشيغان', 'ديترويت', 'Dearborn']
  },
  {
    value: 'كاليفورنيا - CA',
    label: 'كاليفورنيا (CA) - California',
    code: 'CA',
    country: 'US',
    nameAr: 'كاليفورنيا',
    nameEn: 'California',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['CA', 'California', 'كاليفورنيا', 'لوس أنجلوس', 'سان فرانسيسكو']
  },
  {
    value: 'نيويورك - NY',
    label: 'نيويورك (NY) - New York',
    code: 'NY',
    country: 'US',
    nameAr: 'نيويورك',
    nameEn: 'New York',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['NY', 'New York', 'نيويورك']
  },
  {
    value: 'تكساس - TX',
    label: 'تكساس (TX) - Texas',
    code: 'TX',
    country: 'US',
    nameAr: 'تكساس',
    nameEn: 'Texas',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['TX', 'Texas', 'تكساس', 'هيوستن', 'دالاس']
  },
  {
    value: 'إلينوي - IL',
    label: 'إلينوي (IL) - Illinois',
    code: 'IL',
    country: 'US',
    nameAr: 'إلينوي',
    nameEn: 'Illinois',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['IL', 'Illinois', 'إلينوي', 'شيكاغو']
  },
  {
    value: 'نيوجيرسي - NJ',
    label: 'نيوجيرسي (NJ) - New Jersey',
    code: 'NJ',
    country: 'US',
    nameAr: 'نيوجيرسي',
    nameEn: 'New Jersey',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['NJ', 'New Jersey', 'نيوجيرسي', 'باترسون']
  },
  {
    value: 'فلوريدا - FL',
    label: 'فلوريدا (FL) - Florida',
    code: 'FL',
    country: 'US',
    nameAr: 'فلوريدا',
    nameEn: 'Florida',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['FL', 'Florida', 'فلوريدا', 'ميامي', 'أورلاندو']
  },
  {
    value: 'أونتاريو - ON',
    label: 'أونتاريو (ON) - Ontario',
    code: 'ON',
    country: 'CA',
    nameAr: 'أونتاريو',
    nameEn: 'Ontario',
    badge: 'كندا',
    badgeClass: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    searchKeywords: ['ON', 'Ontario', 'أونتاريو', 'تورونتو', 'Ottawa']
  },
  {
    value: 'كيبك - QC',
    label: 'كيبك (QC) - Quebec',
    code: 'QC',
    country: 'CA',
    nameAr: 'كيبك',
    nameEn: 'Quebec',
    badge: 'كندا',
    badgeClass: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    searchKeywords: ['QC', 'Quebec', 'كيبك', 'مونتريال']
  },

  // Remaining US States (Alphabetical by English abbreviation/name)
  {
    value: 'ألاباما - AL',
    label: 'ألاباما (AL) - Alabama',
    code: 'AL',
    country: 'US',
    nameAr: 'ألاباما',
    nameEn: 'Alabama',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['AL', 'Alabama', 'ألاباما']
  },
  {
    value: 'ألاسكا - AK',
    label: 'ألاسكا (AK) - Alaska',
    code: 'AK',
    country: 'US',
    nameAr: 'ألاسكا',
    nameEn: 'Alaska',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['AK', 'Alaska', 'ألاسكا']
  },
  {
    value: 'أريزونا - AZ',
    label: 'أريزونا (AZ) - Arizona',
    code: 'AZ',
    country: 'US',
    nameAr: 'أريزونا',
    nameEn: 'Arizona',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['AZ', 'Arizona', 'أريزونا', 'فينيكس']
  },
  {
    value: 'أركنساس - AR',
    label: 'أركنساس (AR) - Arkansas',
    code: 'AR',
    country: 'US',
    nameAr: 'أركنساس',
    nameEn: 'Arkansas',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['AR', 'Arkansas', 'أركنساس']
  },
  {
    value: 'كولورادو - CO',
    label: 'كولورادو (CO) - Colorado',
    code: 'CO',
    country: 'US',
    nameAr: 'كولورادو',
    nameEn: 'Colorado',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['CO', 'Colorado', 'كولورادو', 'دنفر']
  },
  {
    value: 'كونيتيكت - CT',
    label: 'كونيتيكت (CT) - Connecticut',
    code: 'CT',
    country: 'US',
    nameAr: 'كونيتيكت',
    nameEn: 'Connecticut',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['CT', 'Connecticut', 'كونيتيكت']
  },
  {
    value: 'ديلاوير - DE',
    label: 'ديلاوير (DE) - Delaware',
    code: 'DE',
    country: 'US',
    nameAr: 'ديلاوير',
    nameEn: 'Delaware',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['DE', 'Delaware', 'ديلاوير']
  },
  {
    value: 'جورجيا - GA',
    label: 'جورجيا (GA) - Georgia',
    code: 'GA',
    country: 'US',
    nameAr: 'جورجيا',
    nameEn: 'Georgia',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['GA', 'Georgia', 'جورجيا', 'أتلانتا']
  },
  {
    value: 'هاواي - HI',
    label: 'هاواي (HI) - Hawaii',
    code: 'HI',
    country: 'US',
    nameAr: 'هاواي',
    nameEn: 'Hawaii',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['HI', 'Hawaii', 'هاواي']
  },
  {
    value: 'أيداهو - ID',
    label: 'أيداهو (ID) - Idaho',
    code: 'ID',
    country: 'US',
    nameAr: 'أيداهو',
    nameEn: 'Idaho',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['ID', 'Idaho', 'أيداهو']
  },
  {
    value: 'إنديانا - IN',
    label: 'إنديانا (IN) - Indiana',
    code: 'IN',
    country: 'US',
    nameAr: 'إنديانا',
    nameEn: 'Indiana',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['IN', 'Indiana', 'إنديانا']
  },
  {
    value: 'آيوا - IA',
    label: 'آيوا (IA) - Iowa',
    code: 'IA',
    country: 'US',
    nameAr: 'آيوا',
    nameEn: 'Iowa',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['IA', 'Iowa', 'آيوا']
  },
  {
    value: 'كانساس - KS',
    label: 'كانساس (KS) - Kansas',
    code: 'KS',
    country: 'US',
    nameAr: 'كانساس',
    nameEn: 'Kansas',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['KS', 'Kansas', 'كانساس']
  },
  {
    value: 'كنتاكي - KY',
    label: 'كنتاكي (KY) - Kentucky',
    code: 'KY',
    country: 'US',
    nameAr: 'كنتاكي',
    nameEn: 'Kentucky',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['KY', 'Kentucky', 'كنتاكي']
  },
  {
    value: 'لويزيانا - LA',
    label: 'لويزيانا (LA) - Louisiana',
    code: 'LA',
    country: 'US',
    nameAr: 'لويزيانا',
    nameEn: 'Louisiana',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['LA', 'Louisiana', 'لويزيانا', 'نيو أورلينز']
  },
  {
    value: 'مين - ME',
    label: 'مين (ME) - Maine',
    code: 'ME',
    country: 'US',
    nameAr: 'مين',
    nameEn: 'Maine',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['ME', 'Maine', 'مين']
  },
  {
    value: 'ميريلاند - MD',
    label: 'ميريلاند (MD) - Maryland',
    code: 'MD',
    country: 'US',
    nameAr: 'ميريلاند',
    nameEn: 'Maryland',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['MD', 'Maryland', 'ميريلاند', 'بالتيمور']
  },
  {
    value: 'ماساتشوستس - MA',
    label: 'ماساتشوستس (MA) - Massachusetts',
    code: 'MA',
    country: 'US',
    nameAr: 'ماساتشوستس',
    nameEn: 'Massachusetts',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['MA', 'Massachusetts', 'ماساتشوستس', 'بوسطن']
  },
  {
    value: 'مينيسوتا - MN',
    label: 'مينيسوتا (MN) - Minnesota',
    code: 'MN',
    country: 'US',
    nameAr: 'مينيسوتا',
    nameEn: 'Minnesota',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['MN', 'Minnesota', 'مينيسوتا', 'مينيابوليس']
  },
  {
    value: 'مسيسيبي - MS',
    label: 'مسيسيبي (MS) - Mississippi',
    code: 'MS',
    country: 'US',
    nameAr: 'مسيسيبي',
    nameEn: 'Mississippi',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['MS', 'Mississippi', 'مسيسيبي']
  },
  {
    value: 'ميزوري - MO',
    label: 'ميزوري (MO) - Missouri',
    code: 'MO',
    country: 'US',
    nameAr: 'ميزوري',
    nameEn: 'Missouri',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['MO', 'Missouri', 'ميزوري', 'سانت لويس']
  },
  {
    value: 'مونتانا - MT',
    label: 'مونتانا (MT) - Montana',
    code: 'MT',
    country: 'US',
    nameAr: 'مونتانا',
    nameEn: 'Montana',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['MT', 'Montana', 'مونتانا']
  },
  {
    value: 'نبراسكا - NE',
    label: 'نبراسكا (NE) - Nebraska',
    code: 'NE',
    country: 'US',
    nameAr: 'نبراسكا',
    nameEn: 'Nebraska',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['NE', 'Nebraska', 'نبراسكا']
  },
  {
    value: 'نيفادا - NV',
    label: 'نيفادا (NV) - Nevada',
    code: 'NV',
    country: 'US',
    nameAr: 'نيفادا',
    nameEn: 'Nevada',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['NV', 'Nevada', 'نيفادا', 'لاس فيغاس']
  },
  {
    value: 'نيو هامبشاير - NH',
    label: 'نيو هامبشاير (NH) - New Hampshire',
    code: 'NH',
    country: 'US',
    nameAr: 'نيو هامبشاير',
    nameEn: 'New Hampshire',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['NH', 'New Hampshire', 'نيو هامبشاير']
  },
  {
    value: 'نيو مكسيكو - NM',
    label: 'نيو مكسيكو (NM) - New Mexico',
    code: 'NM',
    country: 'US',
    nameAr: 'نيو مكسيكو',
    nameEn: 'New Mexico',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['NM', 'New Mexico', 'نيو مكسيكو']
  },
  {
    value: 'كارولاينا الشمالية - NC',
    label: 'كارولاينا الشمالية (NC) - North Carolina',
    code: 'NC',
    country: 'US',
    nameAr: 'كارولاينا الشمالية',
    nameEn: 'North Carolina',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['NC', 'North Carolina', 'كارولاينا الشمالية', 'شارلوت']
  },
  {
    value: 'داكوتا الشمالية - ND',
    label: 'داكوتا الشمالية (ND) - North Dakota',
    code: 'ND',
    country: 'US',
    nameAr: 'داكوتا الشمالية',
    nameEn: 'North Dakota',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['ND', 'North Dakota', 'داكوتا الشمالية', 'داكوتا']
  },
  {
    value: 'أوهايو - OH',
    label: 'أوهايو (OH) - Ohio',
    code: 'OH',
    country: 'US',
    nameAr: 'أوهايو',
    nameEn: 'Ohio',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['OH', 'Ohio', 'أوهايو', 'كولومبوس', 'كليفلاند']
  },
  {
    value: 'أوكلاهوما - OK',
    label: 'أوكلاهوما (OK) - Oklahoma',
    code: 'OK',
    country: 'US',
    nameAr: 'أوكلاهوما',
    nameEn: 'Oklahoma',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['OK', 'Oklahoma', 'أوكلاهوما']
  },
  {
    value: 'أوريغون - OR',
    label: 'أوريغون (OR) - Oregon',
    code: 'OR',
    country: 'US',
    nameAr: 'أوريغون',
    nameEn: 'Oregon',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['OR', 'Oregon', 'أوريغون', 'بورتلاند']
  },
  {
    value: 'بنسلفانيا - PA',
    label: 'بنسلفانيا (PA) - Pennsylvania',
    code: 'PA',
    country: 'US',
    nameAr: 'بنسلفانيا',
    nameEn: 'Pennsylvania',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['PA', 'Pennsylvania', 'بنسلفانيا', 'فيلادلفيا']
  },
  {
    value: 'رود آيلاند - RI',
    label: 'رود آيلاند (RI) - Rhode Island',
    code: 'RI',
    country: 'US',
    nameAr: 'رود آيلاند',
    nameEn: 'Rhode Island',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['RI', 'Rhode Island', 'رود آيلاند']
  },
  {
    value: 'كارولاينا الجنوبية - SC',
    label: 'كارولاينا الجنوبية (SC) - South Carolina',
    code: 'SC',
    country: 'US',
    nameAr: 'كارولاينا الجنوبية',
    nameEn: 'South Carolina',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['SC', 'South Carolina', 'كارولاينا الجنوبية']
  },
  {
    value: 'داكوتا الجنوبية - SD',
    label: 'داكوتا الجنوبية (SD) - South Dakota',
    code: 'SD',
    country: 'US',
    nameAr: 'داكوتا الجنوبية',
    nameEn: 'South Dakota',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['SD', 'South Dakota', 'داكوتا الجنوبية', 'داكوتا', 'sd', 'south dakota']
  },
  {
    value: 'تينيسي - TN',
    label: 'تينيسي (TN) - Tennessee',
    code: 'TN',
    country: 'US',
    nameAr: 'تينيسي',
    nameEn: 'Tennessee',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['TN', 'Tennessee', 'تينيسي', 'ناشفيل']
  },
  {
    value: 'يوتا - UT',
    label: 'يوتا (UT) - Utah',
    code: 'UT',
    country: 'US',
    nameAr: 'يوتا',
    nameEn: 'Utah',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['UT', 'Utah', 'يوتا', 'سولت ليك']
  },
  {
    value: 'فيرمونت - VT',
    label: 'فيرمونت (VT) - Vermont',
    code: 'VT',
    country: 'US',
    nameAr: 'فيرمونت',
    nameEn: 'Vermont',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['VT', 'Vermont', 'فيرمونت']
  },
  {
    value: 'فرجينيا - VA',
    label: 'فرجينيا (VA) - Virginia',
    code: 'VA',
    country: 'US',
    nameAr: 'فرجينيا',
    nameEn: 'Virginia',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['VA', 'Virginia', 'فرجينيا']
  },
  {
    value: 'واشنطن - WA',
    label: 'واشنطن (WA) - Washington State',
    code: 'WA',
    country: 'US',
    nameAr: 'واشنطن',
    nameEn: 'Washington',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['WA', 'Washington', 'واشنطن', 'سياتل']
  },
  {
    value: 'فرجينيا الغربية - WV',
    label: 'فرجينيا الغربية (WV) - West Virginia',
    code: 'WV',
    country: 'US',
    nameAr: 'فرجينيا الغربية',
    nameEn: 'West Virginia',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['WV', 'West Virginia', 'فرجينيا الغربية']
  },
  {
    value: 'ويسكونسن - WI',
    label: 'ويسكونسن (WI) - Wisconsin',
    code: 'WI',
    country: 'US',
    nameAr: 'ويسكونسن',
    nameEn: 'Wisconsin',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['WI', 'Wisconsin', 'ويسكونسن', 'ميلووكي']
  },
  {
    value: 'وايومنغ - WY',
    label: 'وايومنغ (WY) - Wyoming',
    code: 'WY',
    country: 'US',
    nameAr: 'وايومنغ',
    nameEn: 'Wyoming',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['WY', 'Wyoming', 'وايومنغ']
  },
  {
    value: 'واشنطن العاصمة - DC',
    label: 'واشنطن العاصمة (DC) - Washington D.C.',
    code: 'DC',
    country: 'US',
    nameAr: 'واشنطن العاصمة',
    nameEn: 'Washington D.C.',
    badge: 'أمريكا',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    searchKeywords: ['DC', 'Washington DC', 'العاصمة', 'واشنطن العاصمة']
  },

  // Remaining Canadian Provinces & Territories
  {
    value: 'كولومبيا البريطانية - BC',
    label: 'كولومبيا البريطانية (BC) - British Columbia',
    code: 'BC',
    country: 'CA',
    nameAr: 'كولومبيا البريطانية',
    nameEn: 'British Columbia',
    badge: 'كندا',
    badgeClass: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    searchKeywords: ['BC', 'British Columbia', 'كولومبيا البريطانية', 'فانكوفر']
  },
  {
    value: 'ألبرتا - AB',
    label: 'ألبرتا (AB) - Alberta',
    code: 'AB',
    country: 'CA',
    nameAr: 'ألبرتا',
    nameEn: 'Alberta',
    badge: 'كندا',
    badgeClass: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    searchKeywords: ['AB', 'Alberta', 'ألبرتا', 'كالغاري', 'إدمونتون']
  },
  {
    value: 'مانيتوبا - MB',
    label: 'مانيتوبا (MB) - Manitoba',
    code: 'MB',
    country: 'CA',
    nameAr: 'مانيتوبا',
    nameEn: 'Manitoba',
    badge: 'كندا',
    badgeClass: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    searchKeywords: ['MB', 'Manitoba', 'مانيتوبا', 'وينيبيغ']
  },
  {
    value: 'ساسكاتشوان - SK',
    label: 'ساسكاتشوان (SK) - Saskatchewan',
    code: 'SK',
    country: 'CA',
    nameAr: 'ساسكاتشوان',
    nameEn: 'Saskatchewan',
    badge: 'كندا',
    badgeClass: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    searchKeywords: ['SK', 'Saskatchewan', 'ساسكاتشوان']
  },
  {
    value: 'نوفا سكوشا - NS',
    label: 'نوفا سكوشا (NS) - Nova Scotia',
    code: 'NS',
    country: 'CA',
    nameAr: 'نوفا سكوشا',
    nameEn: 'Nova Scotia',
    badge: 'كندا',
    badgeClass: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    searchKeywords: ['NS', 'Nova Scotia', 'نوفا سكوشا', 'هاليفاكس']
  },
  {
    value: 'نيو برونزويك - NB',
    label: 'نيو برونزويك (NB) - New Brunswick',
    code: 'NB',
    country: 'CA',
    nameAr: 'نيو برونزويك',
    nameEn: 'New Brunswick',
    badge: 'كندا',
    badgeClass: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    searchKeywords: ['NB', 'New Brunswick', 'نيو برونزويك']
  },
  {
    value: 'نيوفاوندلاند ولابرادور - NL',
    label: 'نيوفاوندلاند ولابرادور (NL) - Newfoundland',
    code: 'NL',
    country: 'CA',
    nameAr: 'نيوفاوندلاند ولابرادور',
    nameEn: 'Newfoundland and Labrador',
    badge: 'كندا',
    badgeClass: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    searchKeywords: ['NL', 'Newfoundland', 'نيوفاوندلاند']
  },
  {
    value: 'جزيرة الأمير إدوارد - PE',
    label: 'جزيرة الأمير إدوارد (PE) - PEI',
    code: 'PE',
    country: 'CA',
    nameAr: 'جزيرة الأمير إدوارد',
    nameEn: 'Prince Edward Island',
    badge: 'كندا',
    badgeClass: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    searchKeywords: ['PE', 'PEI', 'Prince Edward Island', 'جزيرة الأمير إدوارد']
  },
  {
    value: 'الأقاليم الشمالية الغربية - NT',
    label: 'الأقاليم الشمالية الغربية (NT)',
    code: 'NT',
    country: 'CA',
    nameAr: 'الأقاليم الشمالية الغربية',
    nameEn: 'Northwest Territories',
    badge: 'كندا',
    badgeClass: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    searchKeywords: ['NT', 'Northwest Territories', 'الأقاليم الشمالية']
  },
  {
    value: 'يوكون - YT',
    label: 'يوكون (YT) - Yukon',
    code: 'YT',
    country: 'CA',
    nameAr: 'يوكون',
    nameEn: 'Yukon',
    badge: 'كندا',
    badgeClass: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    searchKeywords: ['YT', 'Yukon', 'يوكون']
  },
  {
    value: 'نونافوت - NU',
    label: 'نونافوت (NU) - Nunavut',
    code: 'NU',
    country: 'CA',
    nameAr: 'نونافوت',
    nameEn: 'Nunavut',
    badge: 'كندا',
    badgeClass: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    searchKeywords: ['NU', 'Nunavut', 'نونافوت']
  },

  // General fallback
  {
    value: 'أخرى / غير محدد',
    label: 'أخرى / غير محدد',
    code: 'OTHER',
    country: 'OTHER',
    nameAr: 'أخرى / غير محدد',
    nameEn: 'Other / Not Specified',
    searchKeywords: ['أخرى', 'غير محدد', 'other']
  }
];
