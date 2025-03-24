import { motion } from "framer-motion";
import {
  Users,
  Tag,
  Grid,
  Lightbulb,
  Layers,
  FileText,
  Clock,
  BookOpen,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Mail,
  Calendar,
  Link,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";

export function DocumentContentView({ document }: { document: any }) {
  const [textSize, setTextSize] = useState("small"); // small, medium, large
  const [collapsedSections, setCollapsedSections] = useState({});

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId as keyof typeof prev],
    }));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const {
    filename,
    file_size,
    downloaded_at,
    source,
    author,
    drive_web_link,
    email_subject,
    email_received_date,
    analysis,
  } = document;

  const { ai_summary, signals, threads, notes, meta_info, category, sector } = analysis || {};

  const textSizeClasses = {
    small: {
      h1: "text-xl",
      h2: "text-lg",
      body: "text-sm",
      summary: "text-base",
    },
    medium: {
      h1: "text-2xl",
      h2: "text-xl",
      body: "text-base",
      summary: "text-lg",
    },
    large: {
      h1: "text-3xl",
      h2: "text-2xl",
      body: "text-lg",
      summary: "text-xl",
    },
  };

  const textClasses = textSizeClasses[textSize as keyof typeof textSizeClasses];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] },
    },
  };

  const SectionCard = ({
    id,
    icon,
    iconColorClass,
    hoverColorClass,
    title,
    children,
  }: {
    id: string;
    icon: React.ReactNode;
    iconColorClass: string;
    hoverColorClass: string;
    title: string;
    children: React.ReactNode;
  }) => {
    const isCollapsed = collapsedSections[id as keyof typeof collapsedSections];

    return (
      <motion.div
        variants={itemVariants}
        className={`group bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-md 
          border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300 ease-in-out`}
      >
        <div className="flex items-center justify-between p-6 cursor-pointer" onClick={() => toggleSection(id)}>
          <div className="flex items-center">
            <div className={`p-2 rounded-full ${iconColorClass} mr-3 ${hoverColorClass} transition-colors`}>{icon}</div>
            <h2
              className={`font-bold text-gray-900 dark:text-white group-hover:${hoverColorClass
                .replace("bg-", "text-")
                .replace("/30", "")} transition-colors ${textClasses.h2}`}
            >
              {title}
            </h2>
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
          </div>
        </div>
        {!isCollapsed && <div className="px-6 pb-6">{children}</div>}
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-[200px] w-full h-full py-4 md:py-8 max-w-3xl mx-auto px-3 sm:px-4 md:px-6"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6 sticky top-0 z-10 backdrop-blur-lg bg-white/90 dark:bg-gray-900/90 rounded-2xl p-4 md:p-6 border border-gray-200/60 dark:border-gray-700/60 shadow-xl shadow-gray-200/20 dark:shadow-gray-900/20"
      >
        <div className="flex flex-col space-y-3">
          <div className="flex items-start space-x-3">
            <div className="relative hidden sm:block flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg blur opacity-20"></div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-2.5 relative">
                <FileText className="h-5 w-5 md:h-6 md:w-6 text-gradient from-blue-500 to-indigo-500" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className={`font-bold tracking-tight ${textClasses.h1} truncate overflow-hidden text-ellipsis`}>
                {filename}
              </h1>
              <div className="flex flex-wrap items-center mt-1 text-xs text-gray-500 dark:text-gray-400 gap-2">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  <span className="truncate">{formatDate(downloaded_at)}</span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="h-3 w-3 mr-1" />
                  <span>{formatFileSize(file_size)}</span>
                </div>
                {source && (
                  <div className="flex items-center">
                    <Mail className="h-3 w-3 mr-1" />
                    <span>Source: {source}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-shrink-0">
              <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-full p-1">
                <button
                  onClick={() => setTextSize("small")}
                  className={`p-1 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-colors ${
                    textSize === "small" ? "bg-white dark:bg-gray-700 shadow-sm" : ""
                  }`}
                  aria-label="Small text"
                  title="Small text"
                >
                  <ZoomOut className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                </button>
                <button
                  onClick={() => setTextSize("medium")}
                  className={`p-1 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-colors ${
                    textSize === "medium" ? "bg-white dark:bg-gray-700 shadow-sm" : ""
                  }`}
                  aria-label="Medium text"
                  title="Reset to medium text"
                >
                  <RotateCcw className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                </button>
                <button
                  onClick={() => setTextSize("large")}
                  className={`p-1 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-colors ${
                    textSize === "large" ? "bg-white dark:bg-gray-700 shadow-sm" : ""
                  }`}
                  aria-label="Large text"
                  title="Large text"
                >
                  <ZoomIn className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">
        <motion.div
          variants={itemVariants}
          className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-4 md:p-6 border border-blue-100/80 dark:border-blue-900/30 hover:shadow-md hover:shadow-blue-100/30 dark:hover:shadow-blue-900/10 transition-shadow"
        >
          <div className="flex items-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-8 w-8 rounded-full flex items-center justify-center mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
            </div>
            <h2
              className={`font-extrabold bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-400 dark:to-indigo-400 inline-block text-transparent bg-clip-text ${textClasses.h2}`}
            >
              Executive Summary
            </h2>
          </div>
          <div className="ml-3 md:ml-11 text-gray-700 dark:text-gray-200 leading-relaxed">
            <p className={`font-medium ${textClasses.summary}`}>{ai_summary}</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-3">
          {category && category.length > 0 && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 sm:p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
              <div className="flex items-center mb-2">
                <Tag className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400 mr-2" />
                <span className="text-2xs sm:text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  CATEGORIES
                </span>
              </div>
              <p className="text-base sm:text-lg font-bold text-emerald-800 dark:text-emerald-200">{category.length}</p>
            </div>
          )}

          {signals && signals.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 sm:p-4 rounded-xl border border-yellow-100 dark:border-yellow-800/30">
              <div className="flex items-center mb-2">
                <Lightbulb className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-600 dark:text-yellow-400 mr-2" />
                <span className="text-2xs sm:text-xs font-semibold text-yellow-700 dark:text-yellow-300">SIGNALS</span>
              </div>
              <p className="text-base sm:text-lg font-bold text-yellow-800 dark:text-yellow-200">{signals.length}</p>
            </div>
          )}

          {author && author.length > 0 && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 sm:p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
              <div className="flex items-center mb-2">
                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-600 dark:text-indigo-400 mr-2" />
                <span className="text-2xs sm:text-xs font-semibold text-indigo-700 dark:text-indigo-300 relative z-5">
                  AUTHORS
                </span>
              </div>
              <p className="text-base sm:text-lg font-bold text-indigo-800 dark:text-indigo-200">{author.length}</p>
            </div>
          )}

          {threads && threads.length > 0 && (
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 sm:p-4 rounded-xl border border-purple-100 dark:border-purple-800/30">
              <div className="flex items-center mb-2">
                <Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400 mr-2" />
                <span className="text-2xs sm:text-xs font-semibold text-purple-700 dark:text-purple-300">THREADS</span>
              </div>
              <p className="text-base sm:text-lg font-bold text-purple-800 dark:text-purple-200">{threads.length}</p>
            </div>
          )}
        </motion.div>

        {signals && signals.length > 0 && (
          <SectionCard
            id="signals"
            icon={<Lightbulb className="h-5 w-5" />}
            iconColorClass="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
            hoverColorClass="group-hover:bg-yellow-100 dark:group-hover:bg-yellow-900/50"
            title="Key Signals"
          >
            <ul className="space-y-4">
              {signals.map((signal: string, index: number) => (
                <li
                  key={index}
                  className={`flex items-start group/item transition-all duration-300 p-3 rounded-xl hover:bg-yellow-50/50 dark:hover:bg-yellow-900/10 ${textClasses.body}`}
                >
                  <div className="relative flex-shrink-0 mr-3">
                    <div className="flex items-center justify-center bg-gradient-to-br from-yellow-400 to-amber-500 text-white rounded-full min-h-[24px] min-w-[24px] h-6 w-6 text-xs font-bold shadow-sm shadow-yellow-200 dark:shadow-yellow-900/20 group-hover/item:shadow-md group-hover/item:shadow-yellow-200/40 dark:group-hover/item:shadow-yellow-900/30 transition-all">
                      {index + 1}
                    </div>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium group-hover/item:text-gray-900 dark:group-hover/item:text-white transition-colors">
                    {signal}
                  </span>
                </li>
              ))}
            </ul>
          </SectionCard>
        )}

        {author && author.length > 0 && (
          <SectionCard
            id="authors"
            icon={<Users className="h-5 w-5" />}
            iconColorClass="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
            hoverColorClass="group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50"
            title="Authors"
          >
            <div className="flex flex-wrap gap-2.5">
              {author.map((authorName: string, index: number) => (
                <div
                  key={index}
                  className={`group relative overflow-hidden bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 py-2 px-5 rounded-xl text-indigo-700 dark:text-indigo-300 transition-all duration-300 hover:shadow-md hover:shadow-indigo-100 dark:hover:shadow-indigo-900/10 ${textClasses.body}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity duration-300"></div>
                  <span className="font-medium relative z-5">{authorName}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {category && category.length > 0 && (
          <SectionCard
            id="categories"
            icon={<Tag className="h-5 w-5" />}
            iconColorClass="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
            hoverColorClass="group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50"
            title="Categories"
          >
            <div className="flex flex-wrap gap-2.5">
              {category.map((cat: string, index: number) => (
                <div
                  key={index}
                  className={`group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 py-2 px-5 rounded-xl text-emerald-700 dark:text-emerald-300 transition-all duration-300 hover:shadow-md hover:shadow-emerald-100 dark:hover:shadow-emerald-900/10 ${textClasses.body}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity duration-300"></div>
                  <span className="font-medium relative z-10">{cat}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {sector && sector.length > 0 && (
          <SectionCard
            id="sectors"
            icon={<Grid className="h-5 w-5" />}
            iconColorClass="bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
            hoverColorClass="group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50"
            title="Sectors"
          >
            <div className="flex flex-wrap gap-2.5">
              {sector.map((sec: string, index: number) => (
                <div
                  key={index}
                  className={`group relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 py-2 px-5 rounded-xl text-amber-700 dark:text-amber-300 transition-all duration-300 hover:shadow-md hover:shadow-amber-100 dark:hover:shadow-amber-900/10 ${textClasses.body}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity duration-300"></div>
                  <span className="font-medium relative z-10">{sec}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {threads && threads.length > 0 && (
          <SectionCard
            id="threads"
            icon={<Layers className="h-5 w-5" />}
            iconColorClass="bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
            hoverColorClass="group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50"
            title="Key Threads"
          >
            <div className="space-y-3">
              {threads.map((thread: string, index: number) => (
                <div
                  key={index}
                  className={`group/item flex items-center bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-900/10 border border-purple-100 dark:border-purple-800/30 rounded-xl p-3.5 text-gray-800 dark:text-gray-200 hover:shadow-sm hover:from-purple-100 hover:to-purple-50 dark:hover:from-purple-900/30 dark:hover:to-purple-900/20 transition-all duration-300 ${textClasses.body}`}
                >
                  <div className="h-2 w-2 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 mr-3 group-hover/item:scale-125 transition-transform"></div>
                  <span className="font-medium">{thread}</span>
                  <ArrowRight className="h-4 w-4 opacity-0 ml-auto text-purple-500 group-hover/item:opacity-100 group-hover/item:translate-x-0.5 transition-all" />
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {notes && (
          <SectionCard
            id="notes"
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M14 4v10.54a4 4 0 1 1-4-3.54h10"></path>
              </svg>
            }
            iconColorClass="bg-gray-50 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400"
            hoverColorClass="group-hover:bg-gray-100 dark:group-hover:bg-gray-800"
            title="Notes"
          >
            <div
              className={`p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/70 rounded-xl border border-gray-200 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 ${textClasses.body}`}
            >
              <p className="font-medium">{notes}</p>
            </div>
          </SectionCard>
        )}

        <SectionCard
          id="sourceDetails"
          icon={<Mail className="h-5 w-5" />}
          iconColorClass="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
          hoverColorClass="group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50"
          title="Source Details"
        >
          <div className="space-y-4">
            {email_subject && (
              <div
                className={`flex flex-col sm:flex-row sm:items-start p-3 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 ${textClasses.body}`}
              >
                <div className="w-full sm:w-24 flex-shrink-0 font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-0">
                  Subject:
                </div>
                <div className="flex-1 text-gray-700 dark:text-gray-300">{email_subject}</div>
              </div>
            )}

            {email_received_date && (
              <div className={`flex flex-col sm:flex-row sm:items-start p-3 rounded-xl ${textClasses.body}`}>
                <div className="w-full sm:w-24 flex-shrink-0 font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-0">
                  Received:
                </div>
                <div className="flex-1 text-gray-700 dark:text-gray-300">{formatDate(email_received_date)}</div>
              </div>
            )}

            {drive_web_link && (
              <div
                className={`flex flex-col sm:flex-row sm:items-start p-3 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 ${textClasses.body}`}
              >
                <div className="w-full sm:w-24 flex-shrink-0 font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-0">
                  Link:
                </div>
                <a
                  href={drive_web_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                >
                  View in Drive
                  <Link className="h-3.5 w-3.5 ml-1.5" />
                </a>
              </div>
            )}
          </div>
        </SectionCard>

        {meta_info && (
          <SectionCard
            id="metaInfo"
            icon={<Calendar className="h-5 w-5" />}
            iconColorClass="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
            hoverColorClass="group-hover:bg-gray-100 dark:group-hover:bg-gray-800/80"
            title="Publication Info"
          >
            <div
              className={`p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/70 rounded-xl border border-gray-200 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 ${textClasses.body}`}
            >
              <p className="font-medium">{meta_info}</p>
            </div>
          </SectionCard>
        )}
      </motion.div>
    </motion.div>
  );
}