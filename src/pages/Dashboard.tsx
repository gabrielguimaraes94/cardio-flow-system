
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout } from '@/components/Layout';
import { Users, FileText, Calendar } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const stats = [
    {
      title: "Pacientes Ativos",
      value: "1,248",
      icon: Users,
      change: "+12%",
      positive: true
    },
    {
      title: "Procedimentos este Mês",
      value: "64",
      icon: FileText,
      change: "+8%",
      positive: true
    },
    {
      title: "Agendamentos Pendentes",
      value: "23",
      icon: Calendar,
      change: "-3%",
      positive: false
    }
  ];

  const recentProcedures = [
    { id: '1', patient: 'João Silva', type: 'Cateterismo', date: '05/05/2025', doctor: 'Dr. Carlos Silva' },
    { id: '2', patient: 'Maria Oliveira', type: 'Angioplastia', date: '04/05/2025', doctor: 'Dra. Ana Santos' },
    { id: '3', patient: 'José Pereira', type: 'Cateterismo', date: '03/05/2025', doctor: 'Dr. Carlos Silva' },
    { id: '4', patient: 'Antônia Souza', type: 'Angioplastia', date: '02/05/2025', doctor: 'Dr. Roberto Almeida' },
  ];

  const upcomingAppointments = [
    { id: '1', patient: 'Fernando Gomes', type: 'Cateterismo', date: '06/05/2025', time: '09:30' },
    { id: '2', patient: 'Carla Dias', type: 'Consulta', date: '06/05/2025', time: '11:00' },
    { id: '3', patient: 'Ricardo Mendes', type: 'Angioplastia', date: '07/05/2025', time: '08:00' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
          <p className="text-gray-500">Bem-vindo ao CardioFlow. Confira os dados da sua clínica.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <div className={`text-xs flex items-center mt-1 ${stat.positive ? 'text-green-500' : 'text-red-500'}`}>
                      {stat.change} desde o mês passado
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-cardio-100 flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-cardio-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Procedimentos Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProcedures.map((procedure) => (
                  <div key={procedure.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{procedure.patient}</p>
                      <p className="text-sm text-gray-500">{procedure.type} • {procedure.date}</p>
                    </div>
                    <div className="text-sm text-right">
                      <p className="text-gray-500">{procedure.doctor}</p>
                      <a href="#" className="text-cardio-500 hover:underline">Ver detalhes</a>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Agendamentos Próximos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{appointment.patient}</p>
                      <p className="text-sm text-gray-500">{appointment.type} • {appointment.date}</p>
                    </div>
                    <div className="text-sm text-right">
                      <p className="font-medium text-cardio-500">{appointment.time}</p>
                      <a href="#" className="text-gray-500 hover:underline">Detalhes</a>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};
