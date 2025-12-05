import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Cloud, Server, Users } from "lucide-react";

const About = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-blue-700" />
            <CardTitle>About / Credits</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-700">
          <p className="text-lg font-semibold text-gray-900">
            This system is designed and developed by CodeClad.
          </p>
          <p>
            CodeClad specializes in modern web development, cloud engineering, and scalable
            backend architectures.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-700" />
              <span>Founder: Muhammad Umair Arif</span>
            </div>
            <div className="flex items-center gap-2">
              <Cloud className="h-4 w-4 text-blue-700" />
              <span>Cloud-native solutions built for reliability and scale.</span>
            </div>
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-blue-700" />
              <span>Robust backend architectures tailored to mission-critical systems.</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <Badge variant="secondary">React</Badge>
            <Badge variant="secondary">TypeScript</Badge>
            <Badge variant="secondary">Node.js</Badge>
            <Badge variant="secondary">Express</Badge>
            <Badge variant="secondary">MongoDB</Badge>
            <Badge variant="secondary">Cloud & DevOps</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default About;

