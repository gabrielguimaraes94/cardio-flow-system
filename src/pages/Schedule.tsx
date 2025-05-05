
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Calendar as CalendarIcon, Clock, Plus, Search, UserPlus, MessageSquare, Mail, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';

interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  doctorName: string;
  room: string;
  clinic: string;
  date: Date;
  time: string;
  procedure: string;
  status: 'confirmed' | 'pending' | 'canceled';
  notificationSent: boolean;
}

export const Schedule: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [filterView, setFilterView] = useState('all');
  const { toast } = useToast();
  
  // Mock data for appointments
  const appointments: Appointment[] = [
    {
      id: '1',
      patientName: 'João Silva',
      patientId: '1',
      doctorName: 'Dr. Cardoso',
      room: 'Sala 101',
      clinic: 'Clínica Central',
      date: new Date(2025, 4, 6), // May 6, 2025
      time: '09:00',
      procedure: 'Cateterismo Cardíaco',
      status: 'confirmed',
      notificationSent: true
    },
    {
      id: '2',
      patientName: 'Maria Oliveira',
      patientId: '2',
      doctorName: 'Dra. Santos',
      room: 'Sala 102',
      clinic: 'Clínica Central',
      date: new Date(2025, 4, 7), // May 7, 2025
      time: '14:30',
      procedure: 'Angioplastia',
      status: 'pending',
      notificationSent: false
    },
    {
      id: '3',
      patientName: 'Carlos Santos',
      patientId: '5',
      doctorName: 'Dr. Cardoso',
      room: 'Sala 103',
      clinic: 'Clínica Norte',
      date: new Date(2025, 4, 5), // May 5, 2025
      time: '11:15',
      procedure: 'Angioplastia',
      status: 'confirmed',
      notificationSent: true
    }
  ];

  // Filtered appointments for the selected date
  const filteredAppointments = appointments.filter(app => {
    if (!date) return false;
    const sameDay = app.date.getDate() === date.getDate();
    const sameMonth = app.date.getMonth() === date.getMonth();
    const sameYear = app.date.getFullYear() === date.getFullYear();
    
    if (filterView === 'all') return sameDay && sameMonth && sameYear;
    if (filterView === 'doctor-cardoso') return sameDay && sameMonth && sameYear && app.doctorName === 'Dr. Cardoso';
    if (filterView === 'room-101') return sameDay && sameMonth && sameYear && app.room === 'Sala 101';
    if (filterView === 'clinic-central') return sameDay && sameMonth && sameYear && app.clinic === 'Clínica Central';
    
    return sameDay && sameMonth && sameYear;
  });

  // Form for booking appointments
  const appointmentForm = useForm({
    defaultValues: {
      patient: '',
      doctor: '',
      procedure: '',
      room: '',
      clinic: '',
      date: new Date(),
      time: '',
      sendSMS: true,
      sendEmail: true
    }
  });

  const handleBookAppointment = (data: any) => {
    // In a real app, this would save to a database
    console.log('Booking appointment:', data);
    toast({
      title: "Agendamento criado",
      description: `${data.procedure} agendado para ${format(data.date, 'dd/MM/yyyy')} às ${data.time}.`,
    });
    
    // Show confirmation notification
    toast({
      title: "Confirmação enviada",
      description: "Uma confirmação foi enviada para o paciente por SMS e e-mail.",
    });
    
    setShowAppointmentForm(false);
  };

  const handleSendPreparation = (appointment: Appointment) => {
    // In a real app, this would send actual instructions
    toast({
      title: "Instruções enviadas",
      description: `Instruções de preparação enviadas para ${appointment.patientName}.`,
    });
  };

  const formatSelectedDate = () => {
    if (!date) return 'Selecione uma data';
    return format(date, "dd 'de' MMMM 'de' yyyy");
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-1">Agenda</h2>
            <p className="text-gray-500">Gerenciar agendamentos de procedimentos</p>
          </div>
          <Button 
            className="bg-cardio-500 hover:bg-cardio-600" 
            onClick={() => setShowAppointmentForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-12">
          {/* Calendar Column */}
          <Card className="md:col-span-4">
            <CardHeader>
              <CardTitle className="text-lg">Calendário</CardTitle>
              <CardDescription>Selecione uma data para ver os agendamentos</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="w-full border rounded-md"
              />
            </CardContent>
          </Card>

          {/* Appointments Column */}
          <div className="md:col-span-8 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-lg font-semibold">Agendamentos</CardTitle>
                  <CardDescription>{formatSelectedDate()}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select 
                    value={filterView}
                    onValueChange={setFilterView}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Visualização</SelectLabel>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="doctor-cardoso">Dr. Cardoso</SelectItem>
                        <SelectItem value="room-101">Sala 101</SelectItem>
                        <SelectItem value="clinic-central">Clínica Central</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {filteredAppointments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Horário</TableHead>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Médico</TableHead>
                        <TableHead>Procedimento</TableHead>
                        <TableHead>Local</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAppointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>{appointment.time}</TableCell>
                          <TableCell className="font-medium">{appointment.patientName}</TableCell>
                          <TableCell>{appointment.doctorName}</TableCell>
                          <TableCell>{appointment.procedure}</TableCell>
                          <TableCell>{`${appointment.room} - ${appointment.clinic}`}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleSendPreparation(appointment)}
                                title="Enviar instruções de preparação"
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                title="Enviar SMS"
                              >
                                <Phone className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                title="Ver detalhes"
                              >
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Não há agendamentos para esta data.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Appointment Form */}
            {showAppointmentForm && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Novo Agendamento</CardTitle>
                  <CardDescription>Preencha os dados para agendar um procedimento</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...appointmentForm}>
                    <form onSubmit={appointmentForm.handleSubmit(handleBookAppointment)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={appointmentForm.control}
                          name="patient"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Paciente</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione um paciente" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1">João Silva</SelectItem>
                                  <SelectItem value="2">Maria Oliveira</SelectItem>
                                  <SelectItem value="5">Carlos Santos</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={appointmentForm.control}
                          name="doctor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Médico</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione um médico" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="dr-cardoso">Dr. Cardoso</SelectItem>
                                  <SelectItem value="dra-santos">Dra. Santos</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={appointmentForm.control}
                          name="procedure"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Procedimento</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione um procedimento" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="cateterismo">Cateterismo Cardíaco</SelectItem>
                                  <SelectItem value="angioplastia">Angioplastia</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={appointmentForm.control}
                          name="clinic"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Consultório</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione um consultório" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="clinica-central">Clínica Central</SelectItem>
                                  <SelectItem value="clinica-norte">Clínica Norte</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={appointmentForm.control}
                          name="room"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sala</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma sala" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="sala-101">Sala 101</SelectItem>
                                  <SelectItem value="sala-102">Sala 102</SelectItem>
                                  <SelectItem value="sala-103">Sala 103</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={appointmentForm.control}
                          name="date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Data</FormLabel>
                              <FormControl>
                                <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2">
                                  {field.value ? format(field.value, 'dd/MM/yyyy') : 'Selecione uma data'}
                                  <Calendar 
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) => date < new Date()}
                                    initialFocus
                                    className="hidden" // Only show when needed
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={appointmentForm.control}
                          name="time"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Horário</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione um horário" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="08:00">08:00</SelectItem>
                                  <SelectItem value="09:00">09:00</SelectItem>
                                  <SelectItem value="10:00">10:00</SelectItem>
                                  <SelectItem value="11:00">11:00</SelectItem>
                                  <SelectItem value="14:00">14:00</SelectItem>
                                  <SelectItem value="15:00">15:00</SelectItem>
                                  <SelectItem value="16:00">16:00</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Confirmação Automática</h4>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="sendSMS"
                              className="rounded border-gray-300"
                              checked
                            />
                            <label htmlFor="sendSMS" className="text-sm">
                              Enviar confirmação por SMS
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="sendEmail"
                              className="rounded border-gray-300"
                              checked
                            />
                            <label htmlFor="sendEmail" className="text-sm">
                              Enviar confirmação por e-mail
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="sendPreparation"
                              className="rounded border-gray-300"
                              checked
                            />
                            <label htmlFor="sendPreparation" className="text-sm">
                              Enviar instruções de preparação
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => setShowAppointmentForm(false)}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit">Agendar</Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Schedule;
