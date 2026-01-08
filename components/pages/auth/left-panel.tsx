import {
  CheckCircle,
    Shield,
    TrendingUp,
    Zap,
  } from "lucide-react"

function LeftPanel() {
  return (
    <div className="flex-1 bg-linear-to-br from-blue-50 via-white to-blue-50 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-lg space-y-5 w-full relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-linear-to-br from-primary to-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-xl">
              AC
            </div>
            <div>
              <div className="text-2xl font-bold bg-linear-to-r from-primary to-blue-700 bg-clip-text text-transparent">
                AceCPAs
              </div>
              <div className="text-xs text-muted-foreground">Financial Intelligence Platform</div>
            </div>
          </div>

          {/* Tagline */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-white shadow-lg">
            <h2 className="text-lg font-semibold text-foreground mb-2">
              AI-Powered Quality of Earnings Analysis
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Automate data ingestion, COA mapping, and anomaly detection to reduce time-to-analysis by 60%
            </p>
          </div>

          {/* Trust Badge */}
          <div className="flex items-center gap-2 text-sm text-foreground bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="font-medium">Trusted by 500+ CPA Firms</span>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/50 shadow-sm hover:shadow-md transition-all">
              <div className="w-9 h-9 bg-linear-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">60% Faster Analysis</div>
                <div className="text-xs text-muted-foreground">Automate manual tasks</div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/50 shadow-sm hover:shadow-md transition-all">
              <div className="w-9 h-9 bg-linear-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">AI-Assisted Mapping</div>
                <div className="text-xs text-muted-foreground">Intelligent COA categorization</div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/50 shadow-sm hover:shadow-md transition-all">
              <div className="w-9 h-9 bg-linear-to-br from-green-100 to-green-50 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">Enterprise Security</div>
                <div className="text-xs text-muted-foreground">SOC 2 Type II certified</div>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}

export default LeftPanel