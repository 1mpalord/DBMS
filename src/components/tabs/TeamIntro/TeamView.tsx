'use client';

import React from 'react';
import { motion } from 'framer-motion';

const TEAM_MEMBERS = [
    {
        id: 'MEMBER_01',
        name: 'NGUYEN HUYNH TAM NHU',
        role: 'ENTERTAINER',
        tasks: ['> Introduction', '> Embedding Vector']
    },
    {
        id: 'MEMBER_02',
        name: 'VO MINH THU',
        role: 'CONTENT_QUALITY_REVIEWER',
        tasks: ['> Logical Hierarchy', '> Multitenancy']
    },
    {
        id: 'MEMBER_03',
        name: 'LE THANH HA',
        role: 'CONTENT_QUALITY_SUPERVISOR',
        tasks: ['> Data Modelling', '> Content Quality Supervisor']
    },
    {
        id: 'MEMBER_04',
        name: 'NGUYEN TOAN THANG',
        role: 'CODE_VIBING_MASTER',
        tasks: ['> Webpage Demo Design', '> Data Query']
    },
    {
        id: 'MEMBER_05',
        name: 'NGUYEN THE ANH',
        role: 'THEORY_MASTER',
        tasks: ['> Architecture of Pinecone', '> Content Quality Supervisor']
    }
];

export function TeamView() {
    return (
        <div className="h-full w-full p-8 flex flex-col">
            <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl font-bold text-[#bef264] mb-2"
            >
                01_TEAM_MEMBER
            </motion.h2>
            <div className="w-full h-px bg-[#bef264]/30 mb-8" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {TEAM_MEMBERS.map((member, index) => (
                    <motion.div
                        key={member.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative bg-black/40 border border-[#bef264]/20 p-6 group hover:bg-[#bef264]/5 hover:border-[#bef264]/60 transition-all duration-300"
                    >
                        <div className="absolute top-0 left-0 bg-[#bef264]/20 px-2 py-1">
                            <span className="text-[10px] font-mono font-bold text-[#bef264]">{member.id}</span>
                        </div>

                        <h3 className="text-xl font-bold text-[#bef264] mt-6 mb-2 group-hover:text-white transition-colors">
                            {member.name}
                        </h3>
                        <div className="text-xs font-mono text-[#bef264]/70 mb-4 uppercase tracking-wider">
                            {member.role}
                        </div>

                        <div className="space-y-1">
                            <div className="text-[10px] text-gray-500 uppercase mb-1">CURRENT_TASK</div>
                            {member.tasks.map((task, i) => (
                                <div key={i} className="text-sm text-gray-300 font-mono">
                                    {task}
                                </div>
                            ))}
                        </div>

                        {/* Corner accents */}
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#bef264]/40 group-hover:border-[#bef264] transition-colors" />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
