"use client"

import { motion } from "framer-motion"
import { useState } from "react"

type TeamMember = {
  id: number
  name: string
  fullName: string
  quote: string
  quoteAuthor: string
  role: string
  description: string
  image: string
}

export default function TeamPage() {
  const teamMembers: TeamMember[] = [
    {
      id: 1,
      name: "Bryan John",
      fullName: "Bryan Sohan John",
      quote: "The future belongs to those who believe in the beauty of their dreams.",
      quoteAuthor: "Eleanor Roosevelt",
      role: "Machine Learning & Frontend Developer",
      description:
        "A passionate Machine Learning and Frontend Developer, Bryan is dedicated to crafting innovative solutions that bridge technology and user experience.",
      image: "/bryan.jpeg",
    },
    {
      id: 2,
      name: "Manasa D'Costa",
      fullName: "Manasa Shereen D'Costa",
      quote: "The only limit to our realization of tomorrow will be our doubts of today.",
      quoteAuthor: "Franklin D. Roosevelt",
      role: "Machine Learning Developer & Data Analyst",
      description:
        "A skilled Machine Learning Developer and Data Analyst, Manasa excels at transforming complex data into actionable insights and building intelligent solutions.",
      image: "/manasa.jpeg",
    },
    {
      id: 3,
      name: "Maxon Fernandes",
      fullName: "Maxon Fernandes",
      quote: "Success is not the key to happiness. Happiness is the key to success.",
      quoteAuthor: "Albert Schweitzer",
      role: "Lead Machine Learning Developer",
      description:
        "An accomplished Lead Machine Learning Developer, Maxon specializes in designing advanced AI models and guiding teams to deliver impactful, data-driven solutions.",
      image: "/maxon3.jpeg",
    },
    {
      id: 4,
      name: "Sanchia D'Souza",
      fullName: "Sanchia Lara D'Souza",
      quote: "The best way to predict the future is to create it.",
      quoteAuthor: "Peter Drucker",
      role: "Machine Learning & Backend Developer",
      description:
        "A versatile Machine Learning and Backend Developer, Sanchia combines expertise in AI and backend systems to create robust, intelligent solutions.",
      image: "/sanchia.jpeg",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-10 text-center">
      <motion.h1
        className="text-4xl font-bold mb-4 text-black"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Meet the Team
      </motion.h1>

      <motion.p
        className="text-lg mb-12 max-w-3xl mx-auto text-gray-700"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        The brilliant minds behind SignSerenade. A dedicated team working tirelessly to make communication seamless for
        everyone.
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
        {teamMembers.map((member, index) => (
          <TeamMemberCard key={member.id} member={member} index={index} />
        ))}
      </div>
    </div>
  )
}

function TeamMemberCard({ member, index }: { member: TeamMember; index: number }) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <motion.div
      className="w-80 h-[28rem]"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.05 }}
    >
      <div
      className="relative w-full h-full perspective-1000"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      >
      <motion.div
        className="w-full h-full relative preserve-3d transition-all duration-500"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
      >
        {/* Front of card */}
        <div className="absolute w-full h-full backface-hidden rounded-xl overflow-hidden bg-[#c7d7f5] flex flex-col justify-center items-center shadow-lg">
        <div className="w-full h-full overflow-hidden">
          <img
          src={member.image || "/placeholder.svg"}
          alt={member.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          />
        </div>
        <h3 className="text-xl font-semibold text-[#4a628a] py-2">{member.name}</h3>
        <p className="text-sm italic text-gray-500">“{member.quote}”</p>
        <p className="text-xs text-gray-500">{member.quoteAuthor}</p>
        </div>

        {/* Back of card */}
        <div
        className="absolute w-full h-full backface-hidden rounded-xl overflow-hidden bg-[#c7d7f5] flex flex-col justify-center items-center p-6 shadow-lg"
        style={{ transform: "rotateY(180deg)" }}
        >
        <h3 className="text-xl font-semibold mb-2 text-black">{member.fullName}</h3>
        <p className="font-medium mb-4 text-black">{member.role}</p>
        <p className="text-sm text-center text-black">{member.description}</p>
        </div>
      </motion.div>
      </div>
    </motion.div>
  )
}
